import { json, requireAuth, calcScore, serializeLead } from '../_lib.js';

const LEAD_COLUMNS = [
  'name','phone','email','company','source','campaign','medium',
  'status','score','budget','interest','assignee_id','line_id','notes','tags',
  'last_contact','next_follow_up','utm_source','utm_medium','utm_campaign','utm_content','utm_term',
];

const FIELD_MAP = {
  assigneeId: 'assignee_id',
  lineId: 'line_id',
  lastContact: 'last_contact',
  nextFollowUp: 'next_follow_up',
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmContent: 'utm_content',
  utmTerm: 'utm_term',
};

function normalize(body) {
  const out = {};
  for (const [k, v] of Object.entries(body || {})) {
    const col = FIELD_MAP[k] || k;
    if (LEAD_COLUMNS.includes(col)) out[col] = v;
  }
  if (Array.isArray(out.tags)) out.tags = JSON.stringify(out.tags);
  if (typeof out.budget === 'string') out.budget = Number(String(out.budget).replace(/[^\d.-]/g, '')) || null;
  if (typeof out.assignee_id === 'string') out.assignee_id = Number(out.assignee_id) || null;
  return out;
}

export const onRequestGet = async (ctx) => {
  const { session, error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const url = new URL(ctx.request.url);
  const status = url.searchParams.get('status');
  const q = url.searchParams.get('q');

  let sql = `SELECT l.*, u.name AS assignee_name
               FROM leads l
          LEFT JOIN users u ON u.id = l.assignee_id`;
  const where = [];
  const bind = [];
  if (status && status !== 'ALL') { where.push('l.status = ?'); bind.push(status); }
  if (q) {
    where.push('(l.name LIKE ? OR l.email LIKE ? OR l.company LIKE ?)');
    const like = `%${q}%`;
    bind.push(like, like, like);
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY l.score DESC, l.created_at DESC';

  const { results } = await ctx.env.DB.prepare(sql).bind(...bind).all();
  return json({ leads: results.map(serializeLead) });
};

export const onRequestPost = async (ctx) => {
  const { session, error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const body = await ctx.request.json().catch(() => ({}));
  const data = normalize(body);
  data.score = data.score ?? calcScore({ ...body, phone: data.phone, source: data.source, budget: data.budget });
  data.status = data.status || 'NEW';

  const cols = Object.keys(data);
  const placeholders = cols.map(() => '?').join(',');
  const result = await ctx.env.DB.prepare(
    `INSERT INTO leads (${cols.join(',')}) VALUES (${placeholders})`
  ).bind(...cols.map((c) => data[c])).run();

  const id = result.meta.last_row_id;
  await ctx.env.DB.prepare(
    'INSERT INTO lead_activities (lead_id, user_id, action, note) VALUES (?, ?, ?, ?)'
  ).bind(id, session.user.id, 'created', null).run();

  const row = await ctx.env.DB.prepare(
    `SELECT l.*, u.name AS assignee_name FROM leads l LEFT JOIN users u ON u.id = l.assignee_id WHERE l.id = ?`
  ).bind(id).first();
  return json({ lead: serializeLead(row) }, { status: 201 });
};

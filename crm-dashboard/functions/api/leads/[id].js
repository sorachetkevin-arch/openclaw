import { json, error, requireAuth, calcScore, serializeLead } from '../_lib.js';

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

async function loadLead(env, id) {
  return env.DB.prepare(
    `SELECT l.*, u.name AS assignee_name FROM leads l LEFT JOIN users u ON u.id = l.assignee_id WHERE l.id = ?`
  ).bind(id).first();
}

export const onRequestGet = async (ctx) => {
  const { error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const row = await loadLead(ctx.env, ctx.params.id);
  if (!row) return error(404, 'Not found');
  return json({ lead: serializeLead(row) });
};

export const onRequestPatch = async (ctx) => {
  const { session, error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const body = await ctx.request.json().catch(() => ({}));
  const data = normalize(body);
  if (!Object.keys(data).length) return error(400, 'No fields to update');

  const prev = await loadLead(ctx.env, ctx.params.id);
  if (!prev) return error(404, 'Not found');

  if (data.score === undefined) {
    data.score = calcScore({
      phone: data.phone ?? prev.phone,
      line_id: data.line_id ?? prev.line_id,
      budget: data.budget ?? prev.budget,
      source: data.source ?? prev.source,
      interest: data.interest ?? prev.interest,
      notes: data.notes ?? prev.notes,
    });
  }
  data.updated_at = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const cols = Object.keys(data);
  const setSql = cols.map((c) => `${c} = ?`).join(', ');
  await ctx.env.DB.prepare(`UPDATE leads SET ${setSql} WHERE id = ?`)
    .bind(...cols.map((c) => data[c]), ctx.params.id).run();

  if (data.status && data.status !== prev.status) {
    await ctx.env.DB.prepare(
      'INSERT INTO lead_activities (lead_id, user_id, action, note) VALUES (?, ?, ?, ?)'
    ).bind(ctx.params.id, session.user.id, 'status_change', `${prev.status} → ${data.status}`).run();
  }

  const row = await loadLead(ctx.env, ctx.params.id);
  return json({ lead: serializeLead(row) });
};

export const onRequestDelete = async (ctx) => {
  const { error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  await ctx.env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(ctx.params.id).run();
  return json({ ok: true });
};

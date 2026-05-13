import { json, requireAuth, serializeCampaign } from '../_lib.js';

const COLS = ['name','source','budget','spent','status','start_date','end_date','utm_source','utm_medium','utm_campaign','utm_content'];
const FIELD_MAP = {
  startDate: 'start_date', endDate: 'end_date',
  utmSource: 'utm_source', utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign', utmContent: 'utm_content',
};

export const onRequestGet = async (ctx) => {
  const { error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const { results } = await ctx.env.DB.prepare(`
    SELECT c.*,
           (SELECT COUNT(*) FROM leads l WHERE l.campaign = c.name OR l.utm_campaign = c.utm_campaign) AS lead_count,
           (SELECT COUNT(*) FROM leads l WHERE (l.campaign = c.name OR l.utm_campaign = c.utm_campaign) AND l.status = 'WON') AS conversions
      FROM campaigns c ORDER BY c.created_at DESC
  `).all();
  return json({ campaigns: results.map(serializeCampaign) });
};

export const onRequestPost = async (ctx) => {
  const { error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const body = await ctx.request.json().catch(() => ({}));
  const data = {};
  for (const [k, v] of Object.entries(body)) {
    const col = FIELD_MAP[k] || k;
    if (COLS.includes(col)) data[col] = v;
  }
  if (typeof data.budget === 'string') data.budget = Number(String(data.budget).replace(/[^\d.-]/g,'')) || 0;
  const cols = Object.keys(data);
  const result = await ctx.env.DB.prepare(
    `INSERT INTO campaigns (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`
  ).bind(...cols.map((c) => data[c])).run();
  const row = await ctx.env.DB.prepare(
    `SELECT c.*, 0 AS lead_count, 0 AS conversions FROM campaigns c WHERE c.id = ?`
  ).bind(result.meta.last_row_id).first();
  return json({ campaign: serializeCampaign(row) }, { status: 201 });
};

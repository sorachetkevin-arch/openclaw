import { json, error, requireAuth, serializeCampaign } from '../_lib.js';

const COLS = ['name','source','budget','spent','status','start_date','end_date','utm_source','utm_medium','utm_campaign','utm_content'];
const FIELD_MAP = {
  startDate: 'start_date', endDate: 'end_date',
  utmSource: 'utm_source', utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign', utmContent: 'utm_content',
};

export const onRequestPatch = async (ctx) => {
  const { error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const body = await ctx.request.json().catch(() => ({}));
  const data = {};
  for (const [k, v] of Object.entries(body)) {
    const col = FIELD_MAP[k] || k;
    if (COLS.includes(col)) data[col] = v;
  }
  if (!Object.keys(data).length) return error(400, 'No fields to update');
  const cols = Object.keys(data);
  await ctx.env.DB.prepare(
    `UPDATE campaigns SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`
  ).bind(...cols.map((c) => data[c]), ctx.params.id).run();

  const row = await ctx.env.DB.prepare(`
    SELECT c.*,
           (SELECT COUNT(*) FROM leads l WHERE l.campaign = c.name OR l.utm_campaign = c.utm_campaign) AS lead_count,
           (SELECT COUNT(*) FROM leads l WHERE (l.campaign = c.name OR l.utm_campaign = c.utm_campaign) AND l.status = 'WON') AS conversions
      FROM campaigns c WHERE c.id = ?
  `).bind(ctx.params.id).first();
  return json({ campaign: serializeCampaign(row) });
};

export const onRequestDelete = async (ctx) => {
  const { error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  await ctx.env.DB.prepare('DELETE FROM campaigns WHERE id = ?').bind(ctx.params.id).run();
  return json({ ok: true });
};

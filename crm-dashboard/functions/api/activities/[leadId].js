import { json, requireAuth } from '../_lib.js';

export const onRequestGet = async (ctx) => {
  const { error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const { results } = await ctx.env.DB.prepare(`
    SELECT a.*, u.name AS user_name
      FROM lead_activities a LEFT JOIN users u ON u.id = a.user_id
     WHERE a.lead_id = ?
     ORDER BY a.created_at DESC
  `).bind(ctx.params.leadId).all();
  return json({ activities: results.map((r) => ({
    id: r.id, leadId: r.lead_id, action: r.action, note: r.note,
    user: r.user_name, createdAt: r.created_at,
  })) });
};

export const onRequestPost = async (ctx) => {
  const { session, error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const body = await ctx.request.json().catch(() => ({}));
  const result = await ctx.env.DB.prepare(
    'INSERT INTO lead_activities (lead_id, user_id, action, note) VALUES (?, ?, ?, ?)'
  ).bind(ctx.params.leadId, session.user.id, body.action || 'note', body.note || null).run();
  return json({ id: result.meta.last_row_id }, { status: 201 });
};

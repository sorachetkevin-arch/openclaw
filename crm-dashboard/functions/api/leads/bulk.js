import { json, error, requireAuth, calcScore, serializeLead } from '../_lib.js';

export const onRequestPost = async (ctx) => {
  const { session, error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const body = await ctx.request.json().catch(() => ({}));
  const rows = Array.isArray(body.leads) ? body.leads : null;
  if (!rows || !rows.length) return error(400, 'leads[] required');

  const inserted = [];
  for (const r of rows) {
    const tags = Array.isArray(r.tags) ? JSON.stringify(r.tags) : (r.tags || '[]');
    const score = r.score ?? calcScore(r);
    const result = await ctx.env.DB.prepare(
      `INSERT INTO leads (name, phone, email, company, source, status, score, budget, line_id, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      r.name || 'Unnamed', r.phone || null, r.email || null, r.company || null,
      r.source || null, r.status || 'NEW', score,
      Number(String(r.budget || '').replace(/[^\d.-]/g, '')) || null,
      r.lineId || r.line_id || null, tags,
    ).run();
    const id = result.meta.last_row_id;
    const row = await ctx.env.DB.prepare(
      `SELECT l.*, u.name AS assignee_name FROM leads l LEFT JOIN users u ON u.id = l.assignee_id WHERE l.id = ?`
    ).bind(id).first();
    inserted.push(serializeLead(row));
  }
  await ctx.env.DB.prepare(
    'INSERT INTO lead_activities (lead_id, user_id, action, note) VALUES (?, ?, ?, ?)'
  ).bind(inserted[0]?.id || null, session.user.id, 'bulk_import', `Imported ${inserted.length} leads`).run().catch(() => {});

  return json({ leads: inserted }, { status: 201 });
};

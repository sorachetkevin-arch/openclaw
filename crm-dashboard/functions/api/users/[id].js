import { json, error, requireAuth, serializeUser } from '../_lib.js';

const FIELD_MAP = {
  lineLinked: 'line_linked',
  lineUserId: 'line_user_id',
};
const COLUMNS = ['name','email','role','status','phone','dept','line_linked','line_user_id','color'];

export const onRequestPatch = async (ctx) => {
  const { session, error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  if (session.user.role === 'USER' && Number(session.user.id) !== Number(ctx.params.id)) {
    return error(403, 'Forbidden');
  }
  const body = await ctx.request.json().catch(() => ({}));
  const data = {};
  for (const [k, v] of Object.entries(body)) {
    const col = FIELD_MAP[k] || k;
    if (COLUMNS.includes(col)) data[col] = col === 'line_linked' ? (v ? 1 : 0) : v;
  }
  if (!Object.keys(data).length) return error(400, 'No fields to update');
  const cols = Object.keys(data);
  await ctx.env.DB.prepare(
    `UPDATE users SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`
  ).bind(...cols.map((c) => data[c]), ctx.params.id).run();

  const row = await ctx.env.DB.prepare(
    `SELECT u.*, (SELECT COUNT(*) FROM leads l WHERE l.assignee_id = u.id) AS lead_count
       FROM users u WHERE u.id = ?`
  ).bind(ctx.params.id).first();
  return json({ user: serializeUser(row) });
};

export const onRequestDelete = async (ctx) => {
  const { session, error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  if (session.user.role !== 'SUPER_ADMIN') return error(403, 'Super admin only');
  await ctx.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(ctx.params.id).run();
  return json({ ok: true });
};

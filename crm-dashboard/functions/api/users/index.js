import { json, error, requireAuth, sha256Hex, serializeUser } from '../_lib.js';

export const onRequestGet = async (ctx) => {
  const { error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  const { results } = await ctx.env.DB.prepare(`
    SELECT u.*, (SELECT COUNT(*) FROM leads l WHERE l.assignee_id = u.id) AS lead_count
      FROM users u ORDER BY u.id
  `).all();
  return json({ users: results.map(serializeUser) });
};

export const onRequestPost = async (ctx) => {
  const { session, error: e } = await requireAuth(ctx.env, ctx.request);
  if (e) return e;
  if (session.user.role === 'USER') return error(403, 'Admins only');
  const body = await ctx.request.json().catch(() => ({}));
  if (!body.email || !body.name) return error(400, 'name and email required');
  const password = body.password || 'demo1234';
  const password_hash = await sha256Hex(password);
  try {
    const result = await ctx.env.DB.prepare(
      `INSERT INTO users (name, email, password_hash, role, phone, dept, line_linked, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.name, String(body.email).toLowerCase(), password_hash,
      body.role || 'USER', body.phone || null, body.dept || 'Sales',
      body.lineLinked ? 1 : 0,
      body.color || ['#6366F1','#F59E0B','#10B981','#06B6D4','#8B5CF6'][Math.floor(Math.random()*5)],
    ).run();
    const row = await ctx.env.DB.prepare(
      `SELECT u.*, 0 AS lead_count FROM users u WHERE u.id = ?`
    ).bind(result.meta.last_row_id).first();
    return json({ user: serializeUser(row) }, { status: 201 });
  } catch (err) {
    return error(400, err.message || 'Failed to create user');
  }
};

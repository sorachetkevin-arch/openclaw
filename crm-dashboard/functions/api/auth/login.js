import { json, error, sha256Hex, randomToken } from '../_lib.js';

export const onRequestPost = async ({ request, env }) => {
  const { email, password, provider } = await request.json().catch(() => ({}));
  if (!email) return error(400, 'email required');

  const user = await env.DB.prepare(
    'SELECT id, name, email, password_hash, role, status, color FROM users WHERE email = ?'
  ).bind(String(email).toLowerCase()).first();

  if (!user) return error(401, 'Invalid credentials');
  if (user.status !== 'active') return error(403, 'Account inactive');

  if (provider !== 'google') {
    if (!password) return error(400, 'password required');
    const hash = await sha256Hex(password);
    if (hash !== user.password_hash) return error(401, 'Invalid credentials');
  }

  const token = randomToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().replace('T', ' ').slice(0, 19);
  await env.DB.prepare(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(token, user.id, expires).run();

  return json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, color: user.color },
  });
};

import { json, error, readSession } from '../_lib.js';

export const onRequestGet = async ({ request, env }) => {
  const session = await readSession(env, request);
  if (!session) return error(401, 'Unauthorized');
  return json({ user: session.user });
};

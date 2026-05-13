// Cloudflare Pages Functions middleware — CORS, JSON helpers, auth context

export const onRequest = async (context) => {
  const { request, next, env } = context;
  const origin = request.headers.get('Origin') || '';

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
  }

  const res = await next();
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders(origin, env))) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
};

function corsHeaders(origin, env) {
  // In production restrict to the Pages domain; locally allow any origin.
  const allowed = env?.ALLOWED_ORIGIN || '*';
  const allowedOrigin = allowed === '*' ? '*' : (origin === allowed ? origin : '');
  return {
    'Access-Control-Allow-Origin': allowedOrigin || allowed,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

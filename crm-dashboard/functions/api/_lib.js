// Shared helpers for Pages Functions

export const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });

export const error = (status, message) => json({ error: message }, { status });

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function readSession(env, request) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT s.user_id, s.expires_at, u.id, u.name, u.email, u.role, u.status, u.color, u.dept, u.phone
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > datetime('now')`,
  ).bind(token).first();
  if (!row) return null;
  return {
    token,
    user: {
      id: row.id, name: row.name, email: row.email, role: row.role,
      status: row.status, color: row.color, dept: row.dept, phone: row.phone,
    },
  };
}

export async function requireAuth(env, request) {
  const session = await readSession(env, request);
  if (!session) return { error: error(401, 'Unauthorized') };
  return { session };
}

export function calcScore(lead) {
  let score = 0;
  if (lead.phone)                              score += 20;
  if (lead.line_id || lead.lineId)             score += 20;
  if ((lead.budget || 0) > 0)                  score += 15;
  if (['Facebook Ads', 'Google Ads', 'LINE Ads'].includes(lead.source || '')) score += 15;
  if ((lead.interest || '').toLowerCase() === 'high') score += 10;
  if (((lead.notes || '') + '').toLowerCase().includes('contact')) score += 20;
  return Math.min(score, 100);
}

export function parseTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { const v = JSON.parse(value); return Array.isArray(v) ? v : []; } catch { return []; }
}

export function serializeLead(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    company: row.company,
    source: row.source,
    campaign: row.campaign,
    medium: row.medium,
    status: row.status,
    score: row.score,
    budget: row.budget,
    interest: row.interest,
    assigneeId: row.assignee_id,
    assignee: row.assignee_name || null,
    lineId: row.line_id,
    notes: row.notes,
    tags: parseTags(row.tags),
    lastContact: row.last_contact,
    nextFollowUp: row.next_follow_up,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    phone: row.phone,
    dept: row.dept,
    lineLinked: !!row.line_linked,
    lineUserId: row.line_user_id,
    color: row.color,
    joinedAt: row.joined_at,
    leads: row.lead_count ?? 0,
  };
}

export function serializeCampaign(row) {
  return {
    id: row.id,
    name: row.name,
    source: row.source,
    budget: row.budget,
    spent: row.spent,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    leads: row.lead_count ?? 0,
    conversions: row.conversions ?? 0,
    createdAt: row.created_at,
  };
}

/**
 * Pest control CRM API — Cloudflare Worker + D1.
 *
 * Routes (all JSON):
 *   GET    /api/health          liveness + database reachability
 *   GET    /api/jobs            list jobs, newest first (?status=&limit=&offset=)
 *   POST   /api/jobs            create a job
 *   GET    /api/jobs/:id        read one job
 *   PATCH  /api/jobs/:id        update the supplied fields only
 *   DELETE /api/jobs/:id        delete a job
 *
 * Anything not under /api is served from the built frontend via the ASSETS
 * binding, so the SPA and its API share one origin (no CORS in production).
 */

import { Job, JobRow, rowToJob, validateJob } from './schema';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  /** Comma-separated extra origins allowed to call the API (dev servers). */
  ALLOWED_ORIGINS?: string;
}

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      const response = await route(request, env, url);
      for (const [key, value] of Object.entries(cors)) {
        response.headers.set(key, value);
      }
      return response;
    } catch (err) {
      console.error('Unhandled API error', err);
      return json({ error: 'internal_error', message: 'Unexpected server error' }, 500, cors);
    }
  },
} satisfies ExportedHandler<Env>;

async function route(request: Request, env: Env, url: URL): Promise<Response> {
  const segments = url.pathname.split('/').filter(Boolean); // ['api', 'jobs', ':id']

  if (segments[1] === 'health' && segments.length === 2) {
    return handleHealth(env);
  }

  if (segments[1] !== 'jobs') {
    return json({ error: 'not_found', message: `No route for ${url.pathname}` }, 404);
  }

  const id = segments[2] ? decodeURIComponent(segments[2]) : undefined;

  if (segments.length === 2) {
    if (request.method === 'GET') return listJobs(env, url);
    if (request.method === 'POST') return createJob(request, env);
    return methodNotAllowed(['GET', 'POST']);
  }

  if (segments.length === 3 && id) {
    if (request.method === 'GET') return getJob(env, id);
    if (request.method === 'PATCH') return patchJob(request, env, id);
    if (request.method === 'DELETE') return deleteJob(env, id);
    return methodNotAllowed(['GET', 'PATCH', 'DELETE']);
  }

  return json({ error: 'not_found', message: `No route for ${url.pathname}` }, 404);
}

async function handleHealth(env: Env): Promise<Response> {
  try {
    const row = await env.DB.prepare('SELECT COUNT(*) AS count FROM jobs').first<{ count: number }>();
    return json({ ok: true, database: 'reachable', jobs: row?.count ?? 0 });
  } catch (err) {
    console.error('Health check failed', err);
    return json({ ok: false, database: 'unreachable' }, 503);
  }
}

async function listJobs(env: Env, url: URL): Promise<Response> {
  const status = url.searchParams.get('status');
  const limit = clamp(Number(url.searchParams.get('limit')) || DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);

  const where = status ? 'WHERE status = ?' : '';
  const bindings = status ? [status, limit, offset] : [limit, offset];

  const { results } = await env.DB
    .prepare(`SELECT * FROM jobs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...bindings)
    .all<JobRow>();

  return json({ jobs: (results ?? []).map(rowToJob), limit, offset });
}

async function getJob(env: Env, id: string): Promise<Response> {
  const row = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first<JobRow>();
  if (!row) return json({ error: 'not_found', message: `No job with id ${id}` }, 404);
  return json({ job: rowToJob(row) });
}

async function createJob(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (!body) return json({ error: 'invalid_json', message: 'Body must be a JSON object' }, 400);

  const errors = validateJob(body, { partial: false });
  if (errors.length) return json({ error: 'validation_failed', errors }, 422);

  const now = new Date().toISOString();
  const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : generateId();

  const existing = await env.DB.prepare('SELECT id FROM jobs WHERE id = ?').bind(id).first();
  if (existing) {
    return json({ error: 'conflict', message: `Job ${id} already exists` }, 409);
  }

  const job = { ...body, id, createdAt: (body.createdAt as string) ?? now } as unknown as Job;

  await env.DB
    .prepare(
      `INSERT INTO jobs (
         id, created_at, customer_name, customer_phone, customer_line_id, address,
         insect_types, property_type, area_m2, problem_description, status,
         estimated_price, final_price, scheduled_date, completed_date, technician,
         notes, source, warranty_months, follow_up_date, updated_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      job.id,
      job.createdAt,
      job.customerName,
      job.customerPhone,
      job.customerLineId ?? null,
      job.address,
      JSON.stringify(job.insectTypes ?? []),
      job.propertyType,
      Number(job.areaM2),
      job.problemDescription ?? '',
      job.status ?? 'new',
      Number(job.estimatedPrice ?? 0),
      nullableNumber(job.finalPrice),
      job.scheduledDate ?? null,
      job.completedDate ?? null,
      job.technician ?? null,
      job.notes ?? null,
      job.source,
      nullableNumber(job.warrantyMonths),
      job.followUpDate ?? null,
      now,
    )
    .run();

  return getJobResponse(env, job.id, 201);
}

/** Maps camelCase API fields to their column names. Unlisted fields are ignored. */
const PATCHABLE: Record<string, string> = {
  customerName: 'customer_name',
  customerPhone: 'customer_phone',
  customerLineId: 'customer_line_id',
  address: 'address',
  insectTypes: 'insect_types',
  propertyType: 'property_type',
  areaM2: 'area_m2',
  problemDescription: 'problem_description',
  status: 'status',
  estimatedPrice: 'estimated_price',
  finalPrice: 'final_price',
  scheduledDate: 'scheduled_date',
  completedDate: 'completed_date',
  technician: 'technician',
  notes: 'notes',
  source: 'source',
  warrantyMonths: 'warranty_months',
  followUpDate: 'follow_up_date',
};

async function patchJob(request: Request, env: Env, id: string): Promise<Response> {
  const body = await readJson(request);
  if (!body) return json({ error: 'invalid_json', message: 'Body must be a JSON object' }, 400);

  const errors = validateJob(body, { partial: true });
  if (errors.length) return json({ error: 'validation_failed', errors }, 422);

  const exists = await env.DB.prepare('SELECT id FROM jobs WHERE id = ?').bind(id).first();
  if (!exists) return json({ error: 'not_found', message: `No job with id ${id}` }, 404);

  const assignments: string[] = [];
  const values: unknown[] = [];

  for (const [field, column] of Object.entries(PATCHABLE)) {
    if (!(field in body)) continue;
    const value = body[field];
    assignments.push(`${column} = ?`);
    if (field === 'insectTypes') values.push(JSON.stringify(value ?? []));
    else if (value === null || value === '') values.push(null);
    else if (['areaM2', 'estimatedPrice', 'finalPrice', 'warrantyMonths'].includes(field)) {
      values.push(Number(value));
    } else values.push(value);
  }

  if (!assignments.length) {
    return json({ error: 'no_op', message: 'No updatable fields in body' }, 400);
  }

  assignments.push('updated_at = ?');
  values.push(new Date().toISOString(), id);

  await env.DB
    .prepare(`UPDATE jobs SET ${assignments.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return getJobResponse(env, id, 200);
}

async function deleteJob(env: Env, id: string): Promise<Response> {
  const result = await env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(id).run();
  if (!result.meta.changes) {
    return json({ error: 'not_found', message: `No job with id ${id}` }, 404);
  }
  return new Response(null, { status: 204 });
}

async function getJobResponse(env: Env, id: string, status: number): Promise<Response> {
  const row = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first<JobRow>();
  if (!row) return json({ error: 'not_found', message: `No job with id ${id}` }, 404);
  return json({ job: rowToJob(row) }, status);
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const parsed = await request.json();
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra },
  });
}

function methodNotAllowed(allowed: string[]): Response {
  return json({ error: 'method_not_allowed', allowed }, 405, { allow: allowed.join(', ') });
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const headers: Record<string, string> = {
    'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };

  // Same-origin calls from the SPA need no ACAO header; only echo an origin we
  // were explicitly configured to trust.
  if (origin && allowed.includes(origin)) {
    headers['access-control-allow-origin'] = origin;
  }
  return headers;
}

function nullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function generateId(): string {
  // JOB-<base36 timestamp><random> — sortable-ish and readable in the UI.
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JOB-${stamp}${rand}`;
}

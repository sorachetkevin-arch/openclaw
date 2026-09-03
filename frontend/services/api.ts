/**
 * Client for the Cloudflare Worker jobs API.
 *
 * In production the SPA is served by the same Worker that serves /api, so the
 * default base URL is relative and no CORS is involved. For local development
 * against a remote Worker, set VITE_API_BASE_URL.
 */

import { Job } from '../types';

const BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export interface FieldError {
  field: string;
  message: string;
}

/** Thrown for any non-2xx response, carrying field errors when the API sent them. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldError[];

  constructor(status: number, code: string, message: string, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  /** True when the failure is worth retrying rather than showing to the user as their mistake. */
  get isTransient(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      ...init,
      headers: {
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch (cause) {
    // Network-level failure: offline, DNS, TLS. Status 0 marks it as transient.
    throw new ApiError(0, 'network_error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', []);
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const code = payload?.error ?? 'http_error';
    const message = payload?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(response.status, code, message, payload?.errors ?? []);
  }

  return payload as T;
}

export const jobsApi = {
  list: (params?: { status?: string; limit?: number; offset?: number }): Promise<Job[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const suffix = query.toString() ? `?${query}` : '';
    return request<{ jobs: Job[] }>(`/jobs${suffix}`).then(r => r.jobs);
  },

  get: (id: string): Promise<Job> =>
    request<{ job: Job }>(`/jobs/${encodeURIComponent(id)}`).then(r => r.job),

  create: (job: Partial<Job>): Promise<Job> =>
    request<{ job: Job }>('/jobs', { method: 'POST', body: JSON.stringify(job) }).then(r => r.job),

  update: (id: string, updates: Partial<Job>): Promise<Job> =>
    request<{ job: Job }>(`/jobs/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }).then(r => r.job),

  remove: (id: string): Promise<void> =>
    request<void>(`/jobs/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  health: (): Promise<{ ok: boolean; database: string; jobs: number }> =>
    request('/health'),
};

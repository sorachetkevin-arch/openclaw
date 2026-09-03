/**
 * Jobs state backed by the Worker API, with optimistic updates and a
 * localStorage cache so the app still renders when the network is down.
 *
 * The mutation callbacks keep the fire-and-forget signatures the components
 * already use; failures surface through `error` rather than a rejected promise.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Job } from '../types';
import { ApiError, jobsApi } from '../services/api';

const CACHE_KEY = 'pest-crm-jobs';

type Connection = 'loading' | 'online' | 'offline';

function readCache(): Job[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCache(jobs: Job[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(jobs));
  } catch {
    // Quota or private mode — the cache is an optimisation, not a requirement.
  }
}

export interface UseJobs {
  jobs: Job[];
  connection: Connection;
  /** Set when the last operation failed; cleared by `dismissError` or a success. */
  error: string | null;
  /** True while a mutation is in flight, for disabling submit buttons. */
  saving: boolean;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  refresh: () => void;
  dismissError: () => void;
}

export function useJobs(): UseJobs {
  const [jobs, setJobs] = useState<Job[]>(() => readCache());
  const [connection, setConnection] = useState<Connection>('loading');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Lets a failed mutation restore exactly what was on screen before it.
  const snapshot = useRef<Job[]>([]);

  const load = useCallback(async () => {
    setConnection('loading');
    try {
      const fresh = await jobsApi.list({ limit: 1000 });
      setJobs(fresh);
      writeCache(fresh);
      setConnection('online');
      setError(null);
    } catch (err) {
      setConnection('offline');
      const cached = readCache();
      if (cached.length) setJobs(cached);
      setError(
        err instanceof ApiError && !err.isTransient
          ? err.message
          : 'ทำงานแบบออฟไลน์: แสดงข้อมูลที่บันทึกไว้ในเครื่อง',
      );
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  /** Applies `optimistic` immediately, then runs `commit`, rolling back on failure. */
  const mutate = useCallback(
    async (optimistic: (prev: Job[]) => Job[], commit: () => Promise<Job[] | void>, failure: string) => {
      snapshot.current = jobs;
      setJobs(prev => {
        const next = optimistic(prev);
        writeCache(next);
        return next;
      });
      setSaving(true);
      try {
        const settled = await commit();
        if (settled) {
          setJobs(settled);
          writeCache(settled);
        }
        setConnection('online');
        setError(null);
      } catch (err) {
        setJobs(snapshot.current);
        writeCache(snapshot.current);
        const detail =
          err instanceof ApiError
            ? err.fieldErrors.map(e => `${e.field}: ${e.message}`).join(', ') || err.message
            : String(err);
        setError(`${failure} (${detail})`);
        if (err instanceof ApiError && err.isTransient) setConnection('offline');
      } finally {
        setSaving(false);
      }
    },
    [jobs],
  );

  const addJob = useCallback((job: Job) => {
    void mutate(
      prev => [job, ...prev],
      async () => {
        const created = await jobsApi.create(job);
        // Replace the optimistic row with the server's copy (canonical id/timestamps).
        return [created, ...jobs.filter(j => j.id !== job.id)];
      },
      'บันทึกงานใหม่ไม่สำเร็จ',
    );
  }, [mutate, jobs]);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    void mutate(
      prev => prev.map(j => (j.id === id ? { ...j, ...updates } : j)),
      async () => {
        const updated = await jobsApi.update(id, updates);
        return jobs.map(j => (j.id === id ? updated : j));
      },
      'อัปเดตงานไม่สำเร็จ',
    );
  }, [mutate, jobs]);

  const deleteJob = useCallback((id: string) => {
    void mutate(
      prev => prev.filter(j => j.id !== id),
      async () => {
        await jobsApi.remove(id);
      },
      'ลบงานไม่สำเร็จ',
    );
  }, [mutate]);

  return {
    jobs,
    connection,
    error,
    saving,
    addJob,
    updateJob,
    deleteJob,
    refresh: () => { void load(); },
    dismissError: () => setError(null),
  };
}

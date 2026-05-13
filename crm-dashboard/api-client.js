// CRM API client — talks to /api/* on Cloudflare Pages Functions.
// Exposes `window.api`, `window.auth`, and helpers used by the JSX views.
(function () {
  const STORAGE_KEY = 'crm.session';

  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function saveSession(s, persistent) {
    const payload = JSON.stringify(s);
    if (persistent) {
      localStorage.setItem(STORAGE_KEY, payload);
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, payload);
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  async function call(method, path, body) {
    const session = loadSession();
    const headers = { 'Content-Type': 'application/json' };
    if (session?.token) headers.Authorization = 'Bearer ' + session.token;
    const res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch {}
    if (res.status === 401) {
      clearSession();
      if (!location.pathname.endsWith('/Login.html') && !location.pathname.endsWith('/Login')) {
        location.href = './Login.html';
      }
    }
    if (!res.ok) {
      const err = new Error((data && data.error) || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  const api = {
    auth: {
      login: (email, password, persistent = true) =>
        call('POST', '/api/auth/login', { email, password }).then((r) => { saveSession(r, persistent); return r; }),
      google: (email, persistent = true) =>
        call('POST', '/api/auth/login', { email, provider: 'google' }).then((r) => { saveSession(r, persistent); return r; }),
      logout: () => call('POST', '/api/auth/logout').finally(clearSession),
      me: () => call('GET', '/api/auth/me'),
      session: loadSession,
      clear: clearSession,
    },
    leads: {
      list: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.status) qs.set('status', params.status);
        if (params.q) qs.set('q', params.q);
        const suffix = qs.toString() ? `?${qs}` : '';
        return call('GET', `/api/leads${suffix}`).then((r) => r.leads);
      },
      create: (lead) => call('POST', '/api/leads', lead).then((r) => r.lead),
      update: (id, patch) => call('PATCH', `/api/leads/${id}`, patch).then((r) => r.lead),
      remove: (id) => call('DELETE', `/api/leads/${id}`),
      bulk: (leads) => call('POST', '/api/leads/bulk', { leads }).then((r) => r.leads),
    },
    users: {
      list: () => call('GET', '/api/users').then((r) => r.users),
      create: (u) => call('POST', '/api/users', u).then((r) => r.user),
      update: (id, patch) => call('PATCH', `/api/users/${id}`, patch).then((r) => r.user),
      remove: (id) => call('DELETE', `/api/users/${id}`),
    },
    campaigns: {
      list: () => call('GET', '/api/campaigns').then((r) => r.campaigns),
      create: (c) => call('POST', '/api/campaigns', c).then((r) => r.campaign),
      update: (id, patch) => call('PATCH', `/api/campaigns/${id}`, patch).then((r) => r.campaign),
      remove: (id) => call('DELETE', `/api/campaigns/${id}`),
    },
    dashboard: {
      summary: () => call('GET', '/api/dashboard/summary'),
    },
    activities: {
      list: (leadId) => call('GET', `/api/activities/${leadId}`).then((r) => r.activities),
      add: (leadId, action, note) => call('POST', `/api/activities/${leadId}`, { action, note }),
    },
  };

  window.api = api;
  window.auth = api.auth;
})();

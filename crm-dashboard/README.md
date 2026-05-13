# CRM Lead Copilot Dashboard

Full-stack CRM with real database — frontend served as Cloudflare Pages,
API as Pages Functions, data in **Cloudflare D1** (SQLite). All on the
free tier.

```
┌────────────────────────────────┐    ┌──────────────────────┐    ┌───────────┐
│ Static Pages (HTML + JSX + CSS)│ ─▶ │ /api/*  Pages Funcs  │ ─▶ │ D1 (SQL)  │
│  Login.html / CRM Dashboard.html│    │  (functions/api/...) │    │ DB binding│
└────────────────────────────────┘    └──────────────────────┘    └───────────┘
```

## File layout

```
crm-dashboard/
├── CRM Dashboard.html              Main dashboard entry
├── Login.html                      Sign-in (calls /api/auth/login)
├── LIFF Dashboard.html             Mobile LINE view
├── crm-*.jsx, tweaks-panel.jsx     React (Babel-standalone) views
├── api-client.js                   window.api / window.auth (session in localStorage)
├── functions/
│   ├── _middleware.js              CORS
│   └── api/
│       ├── _lib.js                 Helpers (sha256, sessions, serializers, scoring)
│       ├── auth/                   login, logout, me
│       ├── leads/                  list/create/get/patch/delete + bulk import
│       ├── users/                  list/create/patch/delete
│       ├── campaigns/              list/create/patch/delete
│       ├── activities/[leadId].js  per-lead activity log
│       └── dashboard/summary.js    KPIs + hot leads + follow-ups
├── migrations/
│   ├── 0001_init.sql               schema
│   └── 0002_seed.sql               demo users + leads + campaigns
├── wrangler.toml
└── package.json
```

## Deploy to Cloudflare (free tier)

> Prereqs: a free Cloudflare account, Node 18+.

```bash
cd crm-dashboard
npm install                          # installs wrangler

npx wrangler login                   # opens browser, signs you in

# 1. Create the D1 database
npx wrangler d1 create crm_lead_copilot
# → copy the `database_id` it prints and paste it into wrangler.toml
#   under [[d1_databases]] -> database_id = "<the-uuid>"

# 2. Apply schema + seed to the remote D1
npm run db:migrate:remote

# 3. Deploy the site (first run prompts for project name; use "crm-lead-copilot")
npm run deploy
```

After the first deploy Cloudflare gives you a URL like
`https://crm-lead-copilot.pages.dev` — open it, sign in with the demo
accounts below, and the dashboard pulls live data from D1.

### Binding the D1 database to Pages (one-time, after first deploy)

Cloudflare dashboard → **Workers & Pages → crm-lead-copilot → Settings →
Functions → D1 database bindings → Add**

| Variable name | D1 database         |
|---------------|---------------------|
| `DB`          | `crm_lead_copilot`  |

Redeploy (`npm run deploy`) to pick up the binding.

## Local development

```bash
# create local D1 (stored in .wrangler/state)
npm run db:migrate:local

# run pages + functions locally
npm run dev      # http://localhost:8788
```

The dev server hot-reloads functions, serves the static files, and runs
the API against a local SQLite copy of D1.

## Demo accounts (seeded)

All have password `demo1234`.

| Email           | Role          |
|-----------------|---------------|
| `admin@crm.th`  | SUPER_ADMIN   |
| `john@crm.th`   | ADMIN         |
| `sara@crm.th`   | USER          |
| `mike@crm.th`   | USER          |
| `amy@crm.th`    | USER (inactive) |

## API surface

| Method | Path                          | Notes                                |
|--------|-------------------------------|--------------------------------------|
| POST   | `/api/auth/login`             | `{ email, password }` or `{ email, provider:"google" }` |
| POST   | `/api/auth/logout`            |                                      |
| GET    | `/api/auth/me`                |                                      |
| GET    | `/api/leads?status=&q=`       | list with filters                    |
| POST   | `/api/leads`                  | create — auto lead scoring           |
| GET    | `/api/leads/:id`              |                                      |
| PATCH  | `/api/leads/:id`              | partial update; logs status changes  |
| DELETE | `/api/leads/:id`              |                                      |
| POST   | `/api/leads/bulk`             | CSV import → `{ leads: [...] }`      |
| GET    | `/api/users`                  | with lead-count per user             |
| POST   | `/api/users`                  | admin only                           |
| PATCH  | `/api/users/:id`              |                                      |
| DELETE | `/api/users/:id`              | super-admin only                     |
| GET    | `/api/campaigns`              | + lead count + conversions           |
| POST   | `/api/campaigns`              |                                      |
| PATCH  | `/api/campaigns/:id`          |                                      |
| DELETE | `/api/campaigns/:id`          |                                      |
| GET    | `/api/activities/:leadId`     |                                      |
| POST   | `/api/activities/:leadId`     | `{ action, note }`                   |
| GET    | `/api/dashboard/summary`      | KPI counts + hot leads + follow-ups  |

All routes (except `/api/auth/login`) require `Authorization: Bearer <token>`.
The frontend `api-client.js` handles this; tokens go to `localStorage`
(persistent) or `sessionStorage` (Remember Me off).

## Security notes for a production hand-off

This implementation prioritizes the “make it real, ship to free tier”
goal. Before going to production:

- Replace SHA-256 password hashing with bcrypt/argon2 via Workers
  bindings or move auth to Cloudflare Access / Auth0 / Clerk.
- Treat the simulated Google login (`provider: "google"`) as a fixture
  for demos only — wire real OAuth (PKCE flow) once a domain is set up.
- Add rate limiting on `/api/auth/login` and `/api/leads/capture` (use
  Cloudflare Turnstile or a Workers KV-backed limiter).
- Validate LINE webhook signatures (HMAC-SHA256) before trusting
  inbound messages.
- Enforce role-based row visibility (USER role should only see leads
  where `assignee_id` matches their `user.id`).

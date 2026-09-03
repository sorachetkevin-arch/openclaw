# Deployment — Cloudflare Workers + D1

The pest-control CRM runs as a single Cloudflare Worker that serves both the
built React SPA (via the `ASSETS` binding) and the JSON API under `/api`.
One origin, so the browser makes same-origin requests and CORS is not involved
in production.

```
browser ──► Worker (pest-crm) ──► D1 (pest-crm)
             ├── /api/*   jobs REST API
             └── /*       built SPA from frontend/dist
```

## What already exists

The D1 database is **provisioned and populated**:

| | |
|---|---|
| Database name | `pest-crm` |
| Database ID | `09817523-1a59-4c19-9748-eceb621b4ecf` |
| Region hint | APAC |
| Schema | `worker/migrations/0001_init.sql` (applied) |
| Seed rows | 14 jobs from `worker/seed.sql` (applied) |

The ID is already wired into `worker/wrangler.toml`, so no configuration is
needed to point the Worker at it.

## Deploying

The Worker itself is **not yet deployed** — that needs Cloudflare credentials.

### Option A — from your machine

```bash
cd worker
npx wrangler login          # once
cd ../frontend && npm install && npx vite build
cd ../worker && npx wrangler deploy
```

`wrangler deploy` uploads the Worker, binds D1, and publishes
`frontend/dist` as the static assets. It prints the live
`https://pest-crm.<your-subdomain>.workers.dev` URL.

### Option B — from CI (recommended)

`.github/workflows/deploy-cloudflare.yml` runs the same steps on every push to
`main`. Add two repository secrets first:

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Account ID in the right sidebar |

The token needs `Workers Scripts: Edit` and `D1: Edit` on the account.

## Local development

Run the whole stack the way production runs it — one Worker serving both:

```bash
cd frontend && npm install && npx vite build
cd ../worker && npm install
npx wrangler d1 migrations apply pest-crm --local
npx wrangler d1 execute pest-crm --local --file=./seed.sql
npx wrangler dev --port 8787 --local
```

Then open <http://localhost:8787>. Rebuild the frontend after any UI change.

For fast UI iteration, run Vite separately and point it at the Worker:

```bash
cd worker && npx wrangler dev --port 8787 --local   # terminal 1
cd frontend && VITE_API_BASE_URL=http://localhost:8787 npm run dev   # terminal 2
```

`ALLOWED_ORIGINS` in `wrangler.toml` already allows the Vite dev origin.

## Database operations

```bash
cd worker

# apply new migrations
npx wrangler d1 migrations apply pest-crm --remote

# re-seed (INSERT OR REPLACE — safe to re-run)
npx wrangler d1 execute pest-crm --remote --file=./seed.sql

# ad-hoc query
npx wrangler d1 execute pest-crm --remote --command "SELECT status, COUNT(*) FROM jobs GROUP BY status"
```

Add a migration as `worker/migrations/000N_description.sql`; wrangler tracks
which have been applied.

## API reference

| Method | Path | Success | Notes |
|---|---|---|---|
| GET | `/api/health` | 200 | `{ok, database, jobs}`; 503 if D1 is unreachable |
| GET | `/api/jobs` | 200 | `{jobs, limit, offset}`, newest first; `?status=&limit=&offset=` |
| POST | `/api/jobs` | 201 | `{job}`; 409 on duplicate id |
| GET | `/api/jobs/:id` | 200 | `{job}`; 404 if absent |
| PATCH | `/api/jobs/:id` | 200 | `{job}`; only supplied fields change |
| DELETE | `/api/jobs/:id` | 204 | 404 if absent |

Validation failures return 422 with `{error:"validation_failed", errors:[{field, message}]}`.

## Before this handles real customer data

The API has **no authentication** — every route is open to anyone with the URL,
and the records include customer names, phone numbers and home addresses. Put
Cloudflare Access in front of the Worker, or add a shared-secret check on
`/api/*`, before pointing real customers at it. The `security-surface-tester`
agent in `.claude/agents/` covers this and the rest of the surface.

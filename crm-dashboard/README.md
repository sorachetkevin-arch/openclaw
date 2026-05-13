# CRM Lead Copilot Dashboard

High-fidelity prototype for a full-stack CRM with LINE OA integration. Implemented
from the Claude Design handoff (`CRM Dashboard.html`).

## Files

| File | Role |
|------|------|
| `CRM Dashboard.html` | Main entry — desktop dashboard (loads all JSX modules) |
| `Login.html` | Sign-in page with simulated Google OAuth + demo accounts |
| `LIFF Dashboard.html` | Mobile view tuned for the LINE in-app browser |
| `crm-app.jsx` | Root `CRMApp` component, router, top bar, auth guard |
| `crm-sidebar.jsx` | Left-rail navigation |
| `crm-main-view.jsx` | Dashboard overview (KPI cards, sparklines, hot leads, follow-ups) |
| `crm-leads-view.jsx` | Lead table — CRUD, CSV import, scoring, filters |
| `crm-pipeline-view.jsx` | Kanban pipeline (drag-and-drop across 7 stages) |
| `crm-reports-view.jsx` | Daily / Source / Sales / Campaign reports + PDF export |
| `crm-line-users-view.jsx` | LINE OA config, chat simulator, user admin |
| `tweaks-panel.jsx` | In-page design tweaks (colors, font scale, dark mode) |

## Running locally

The pages use React 18 + Babel Standalone via CDN. Browsers block loading
`type="text/babel" src="..."` from `file://` URLs, so serve the folder over HTTP:

```bash
cd crm-dashboard
python3 -m http.server 8000
# then open http://localhost:8000/Login.html
```

## Demo accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@crm.th` | `demo1234` | SUPER_ADMIN |
| `john@crm.th`  | `demo1234` | ADMIN |
| `sara@crm.th`  | `demo1234` | USER |

After signing in you land on `CRM Dashboard.html`. Sign Out clears the
`localStorage`/`sessionStorage` session and returns to `Login.html`.

## Tech notes for production port

The prototype is intentionally a single-bundle React app. The handoff README
recommends Next.js 14 + TypeScript + Tailwind + Prisma + Postgres; the visual
output here is the contract to match — internal structure can be refactored.

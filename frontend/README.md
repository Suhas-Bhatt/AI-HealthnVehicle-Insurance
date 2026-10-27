# Frontend

React 18 single-page app (Vite + Tailwind CSS) for the insurance fraud-detection portal.

## Setup

```bash
npm install
echo "VITE_AWS_API_URL=https://<your-api-id>.execute-api.<region>.amazonaws.com/prod" > .env
npm run dev              # http://localhost:5173
```

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (proxies `/api/*` to API Gateway) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (requires an ESLint config/dev-dependency, not currently included) |

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_AWS_API_URL` | API Gateway base URL (e.g. `https://<id>.execute-api.<region>.amazonaws.com/prod`) | `/api` (dev proxy) |
| `VITE_AGENTCORE_URL` | Optional separate base URL for AI/analysis endpoints | falls back to `VITE_AWS_API_URL` |

`.env` is git-ignored — never commit it.

## Project structure

```
src/
├── main.jsx, App.jsx        # entry point, auth gate, routes, toast system
├── index.css                # Tailwind layers and theme
├── components/              # Navbar (sidebar), Header, Footer, InsuranceOptions
└── pages/
    ├── api.js               # central API endpoint map
    ├── Auth.jsx             # login / sign-up
    ├── Dashboard.jsx        # global hub: choose Vehicle or Health
    ├── DashboardVehicle.jsx / DashboardHealth.jsx
    ├── ClaimSubmission.jsx  # document checklist + upload + OCR review
    ├── TruthAnalysisVehicle.jsx / TruthAnalysisHealth.jsx   # score, radar chart, reasoning
    ├── Assistant.jsx        # chatbot
    └── Architecture.jsx     # architecture overview
```

## Routes

| Path | Page |
| --- | --- |
| `/login` | Auth (only route available when signed out) |
| `/` | Global dashboard |
| `/:type/dashboard` | Vehicle or health dashboard (`type` = `vehicle` \| `health`) |
| `/:type/submit` | Claim submission |
| `/:type/analysis` | Truth analysis |
| `/:type/assistant` | AI assistant |
| `/:type/architecture` | Architecture |

## Notes

- Authentication state is held in memory only (no token/session persistence) — a page refresh logs the user out.
- `vite.config.js` and `src/pages/Auth.jsx` contain a fallback API Gateway URL; point them at your own deployment (or rely on `VITE_AWS_API_URL`).
- `dist/` is build output and is git-ignored.

# Deployment Guide

## Environments
| Env | Host | Branch | Notes |
|-----|------|--------|-------|
| **Dev** | Vercel Preview | any PR | Ephemeral preview |
| **Staging** | Vercel – `northpath‑stg` | `develop` | Mirrors production settings |
| **Prod** | Vercel – `northpath‑prod` | `main` | Protected branch |

### Steps

1. Push to `main` → GitHub Action runs:  
   * `pnpm install`  
   * `pnpm test`  
   * `pnpm build`  
2. When tests pass, action triggers Vercel production deployment.  
3. Fly.io app (`ora‑api`) redeploys via `fly deploy --detach`.  

Rollback: redeploy previous Vercel build from dashboard → triggers UI version pin.

---

## Additional Recommendations

- **Add Troubleshooting Section:**
  - Common deployment errors and how to resolve them (e.g., build failures, environment variable issues).
- **Document Environment Variables:**
  - List all required variables (see `.env` file) and their purpose.
- **Fly.io API Service:**
  - Add steps for rolling back or redeploying the API if needed.
- **Monitoring & Alerts:**
  - Link to Vercel and Fly.io dashboards, and describe how to set up alerts for failed deploys.
- **Manual Deployments:**
  - Document how to trigger a manual deployment for both Vercel and Fly.io.

## Example: Environment Variables Table

| Variable            | Description                | Example Value           |
|---------------------|---------------------------|------------------------|
| DATABASE_URL        | Postgres connection URL   | postgres://...         |
| NEXT_PUBLIC_API_URL | Public API endpoint       | https://api.example.com|
| ...                 | ...                       | ...                    |

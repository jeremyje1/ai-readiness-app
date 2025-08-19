# Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Front‑end | **Next.js 14** (React, TypeScript, App Router) | SEO‑friendly, easy integration with northpathstrategies.org, Vercel native |
| Component Library | **ShadCN + Tailwind CSS** | Accessible, themable, rapid prototyping |
| State Mgmt | React Server Components + Zustand | Minimal bundle, SSR‑friendly |
| Back‑end | **NestJS** (Node 18) | Scalable, opinionated architecture, typed end‑to‑end |
| Database | **PostgreSQL 16** (hosted on Neon) | Relational joins for hierarchical data |
| Orchestration | Docker Compose (local), Vercel + Fly.io (prod) | Developer ease, global edge |
| Auth | **Auth0** Universal Login → northpathstrategies.org | SSO + MFA |
| CI/CD | GitHub Actions → Vercel Preview & Fly.io Deploy | PR previews, automated tests |
| Testing | Vitest + Playwright | Unit + e2e coverage |

---

## Additional Notes

- **PostCSS:** Uses `@tailwindcss/postcss` and `autoprefixer` for CSS processing.
- **Shared UI:** Imports global theme from `@northpath-ui/theme` for branding consistency.
- **API Integration:** RESTful endpoints via NestJS, with plans for GraphQL support.
- **Monitoring:** Vercel and Fly.io dashboards, Sentry for error tracking.

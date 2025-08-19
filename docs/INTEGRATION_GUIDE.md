# Integration (Post-Consolidation)

The platform has consolidated to a single canonical domain: `aiblueprint.k12aiblueprint.com`.
Legacy subdomains (`app.northpathstrategies.org`, `ai-readiness.northpathstrategies.org`) now 301 redirect and should not be referenced in new integrations.

1. **Canonical Domain:** All embeds / API calls should target `https://aiblueprint.k12aiblueprint.com`.
2. **Branding:** Shared Tailwind / design tokens reside locally; remove references to external `@northpath-ui/theme` unless reintroduced.
3. **Auth (NextAuth + Supabase):** Callback root derives from canonical. If explicit: `NEXTAUTH_URL=https://aiblueprint.k12aiblueprint.com`.
4. **Embed Widgets:**
  * Use iframe pointing to canonical paths (e.g., `/dashboard?embed=1`).
  * Public lightweight status: `/api/status` (extend if additional metrics needed).
5. **Analytics:** GA4 / other analytics should send events with canonical origin. (Legacy UA property placeholder removed.)

---

## Additional Integration Recommendations

- **API Security:** All non-status endpoints require auth (enforced server-side). Review periodically for drift.
- **Widget Embeds:** Supply a signed token or rely on session context; avoid exposing sensitive data via unauthenticated iframes.
- **Branding Consistency:** Centralize palette & typography in `/app/globals.css` and component primitives; remove stale theme package pointers.
- **Analytics Events:** Document core events (checkout_start, checkout_success, assessment_submitted) in a future `ANALYTICS_EVENTS.md`.
- **Testing:** Add Playwright scenarios for embedded dashboard load + auth redirect, and canonical URL enforcement.

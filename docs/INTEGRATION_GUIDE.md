# Integration with northpathstrategies.org

1. **Sub-domain:** Configure DNS `app.northpathstrategies.org` to point to Vercel deployment.
2. **Shared Branding:** Import global CSS/Tailwind config from `@northpath-ui/theme`.
3. **Auth:**
   * Use **Auth0** connection shared with CMS (`northpath-cms`).
   * Configure Application Callback URL: `https://app.northpathstrategies.org/api/auth/callback`.
4. **Embed Widgets:**
   * Use iframe or web components to embed dashboard cards back into the main marketing site.
   * Expose public JSON feed `/api/status` for lightweight stats.
5. **Analytics:** Send custom events to Google Analytics 4 property `UA-NPSTRAT-1`.

---

## Additional Integration Recommendations

- **API Security:**
  - Ensure all API endpoints (except `/api/status`) require authentication.
- **Widget Documentation:**
  - Provide integration code samples for embedding widgets (iframe & web component usage).
- **Branding Consistency:**
  - Document how to update shared theme package and propagate changes.
- **Analytics Events:**
  - List key custom events sent to GA4 and their payload structure.
- **Testing:**
  - Add integration test checklist for SSO, widget embedding, and analytics.

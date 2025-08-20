# Manual Grant & Environment Setup Guide

Use this when a Stripe webhook failed to provision a `user_payments` row and you need to unblock a paying (or pilot) customer immediately.

## 1. Generate a Secure ADMIN_GRANT_TOKEN

Locally (do NOT commit the value):

```bash
openssl rand -hex 32
```

Copy the 64‑hex‑char string (256 bits entropy).

## 2. Add Environment Variables in Vercel

Add (Production + Preview):

| Name | Value | Notes |
|------|-------|-------|
| ADMIN_GRANT_TOKEN | <generated> | Required for /api/payments/manual-grant |
| STRIPE_WEBHOOK_SECRET | <your_stripe_wh_secret> | From Stripe Dashboard (Webhook endpoint) |
| STRIPE_SECRET_KEY | sk_live_... | Live secret key |
| NEXT_PUBLIC_SUPABASE_URL | https://<project>.supabase.co | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | <anon key> | Public anon key |
| SUPABASE_SERVICE_ROLE_KEY | <service role key> | Required for webhooks & manual grant |

Trigger a redeploy (Vercel does this automatically after saving). Confirm new build is live via `/api/version`.

## 3. Manually Grant Access

Replace values and run (macOS zsh):

```bash
ADMIN_GRANT_TOKEN=<same token>
EMAIL="customer+pilot@example.com"
TIER="ai-readiness-comprehensive" # or ai-transformation-blueprint etc.
NAME="Pilot Customer"
DOMAIN="https://aiblueprint.k12aiblueprint.com"

curl -s -X POST "$DOMAIN/api/payments/manual-grant" \
  -H "Authorization: Bearer $ADMIN_GRANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"tier\":\"$TIER\",\"name\":\"$NAME\"}" | jq
```

Expected response:

```json
{ "created": true, "row": { "id": "...", "tier": "ai-readiness-comprehensive", "access_granted": true, ... } }
```
If `created` is false the row already existed (idempotent behavior).

## 4. Verify Access

1. Ask the user to log in (or create password via onboarding email if applicable).
2. Visit: `/ai-readiness/dashboard?debug=1`.
3. If still denied: call `/api/payments/status?debug=1` (e.g. open in browser dev tools) and inspect JSON:
   - `phase: "verified"` indicates success.
   - If `not-found`, check email casing and that `is_test` was not accidentally set.

## 5. Common Failure Checks

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Manual grant 401 | Missing / wrong Bearer token | Re-copy token; ensure no whitespace |
| Dashboard Access Denied after manual grant | User logged in with different email alias or capitalization | Confirm auth session email matches row email (lowercase both) |
| Webhook keeps failing | Missing SUPABASE_SERVICE_ROLE_KEY or STRIPE_WEBHOOK_SECRET | Add env vars & redeploy |
| /api/payments/status 404 | Row not inserted or `access_granted=false` | Re-run manual grant; check row flags |

## 6. Cleanup / Hardening (Optional)

- Rotate `ADMIN_GRANT_TOKEN` periodically; revoke old one by updating var & redeploying.
- Add IP allow list at an edge layer (e.g. Vercel Edge Middleware) for the manual‑grant path if higher assurance is needed.
- Consider adding a short-lived signed admin action workflow instead of static token.

## 7. Future Improvement Ideas

- Refactor dashboard to consume `/api/payments/status` only (single source of truth).
- Add Stripe event idempotency table to log every processed event.
- Add alerting (e.g. Slack webhook) on webhook errors or manual grants.

---
Maintainer quick note: The manual grant endpoint lives at `app/api/payments/manual-grant/route.ts` and requires the service role key; do NOT expose the service role key to the client.

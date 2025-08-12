# Copilot Agent Playbook — AI BLUEPRINT (AI Readiness)

## Mission
Launch AI readiness assessment & board‑ready roadmap generator using the same backbone:
- Stripe tiers, webhook tier assignment, onboarding email.
- Survey/onboarding flow like Realign (`/assessment/onboarding`, `/survey`):contentReference[oaicite:60]{index=60}.
- AI PDF narratives (`/api/report/generate`) for board-ready reports:contentReference[oaicite:61]{index=61}.
- Optional: scenarios/cost modeling if you bundle with Realign’s engine:contentReference[oaicite:62]{index=62}.

## Domain & env (suggested)
```
NEXT_PUBLIC_DOMAIN=aiblueprint.northpathstrategies.org
NEXT_PUBLIC_APP_URL=https://aiblueprint.northpathstrategies.org
# ... same env structure; skip Power BI unless you want an enterprise dashboard here too
```

**ASK THE USER (exact prompts):**
1) “Confirm AI Blueprint domain: aiblueprint.northpathstrategies.org (Y/n).”
2) “Paste values for NEXTAUTH_SECRET, OPENAI_API_KEY, STRIPE keys. Choose email provider.”

## Steps
- Same as MapMyStandards: Railway DB → Vercel → Stripe → webhook → emails.
- Reuse onboarding & survey pages and logic from Realign:contentReference[oaicite:63]{index=63}.
- Reuse AI PDF endpoint for AI strategy narrative:contentReference[oaicite:64]{index=64}.

## Smoke tests
- Onboarding renders; survey starts.
- AI PDF returns a report.
- Stripe test purchase → tier assigned → gated access (if any advanced pages).

Run in Copilot Chat (AI Blueprint):

```arduino
Copilot, follow this playbook, prompt me for secrets and domain, then provision Railway, Vercel, Stripe, and run the smoke tests.
```

### Bonus: tiny shared pieces to drop in (used by all three)
`lib/email.ts` (provider‑agnostic shim)

```ts
export async function sendEmail(to: string, subject: string, html: string) {
  const provider = process.env.EMAIL_PROVIDER;
  if (provider === "RESEND") {
    // import Resend SDK and send
  } else if (provider === "SENDGRID") {
    // import @sendgrid/mail and send
  } else if (provider === "SES") {
    // AWS SES client send
  } else {
    // SMTP (nodemailer)
  }
}
```

Stripe webhook “post‑payment” snippet (pseudo‑flow):

```ts
// Inside /app/api/stripe/webhook/route.ts after event verification
// 1) Map session → customer → email, metadata.tier
// 2) Update user tier in DB
// 3) Send welcome email with onboarding link
// 4) Return 200
(Your tier mapping, success redirects, and webhook responsibilities are already defined and verified in your docs)STRIPE_TIER_INTEGRATION….
```

NextAuth JWT callback (ensure tier in token):

```ts
// in [...nextauth].ts callbacks
jwt({ token, user }) {
  if (user?.tier) token.tier = user.tier;
  return token;
}
session({ session, token }) {
  session.tier = token.tier ?? "INDIVIDUAL";
  return session;
}
(Needed so the middleware can gate /enterprise/dashboard, /scenario/[id])ROUTING_UI_IMPLEMENTATI….
```

Copy‑paste commands for you (fast lane)

REALIGN (run in its workspace):

```pgsql
Copilot, open COPILOT_AGENT_PLAYBOOK.md and run Step A now. Then continue Steps B–H, prompting me only for secrets/domains. When done, post the Vercel URL, domain DNS target, Stripe price IDs, and webhook secret.
```

MAPMYSTANDARDS (run in its workspace):

```pgsql
Copilot, execute this playbook end-to-end. Ask me only for domains and secrets, then provision Railway, Vercel, Stripe, and run the smoke tests for uploads and AI PDF.
```

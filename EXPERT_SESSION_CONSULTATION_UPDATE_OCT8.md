# Expert Session Consultation Upgrade — October 8, 2025

## Price Recommendation
- **Founder Consultation Fee:** **$349 USD** for a 45-minute strategy intensive.
- Rationale: aligns with comparable executive coaching engagements for district and campus leaders, values access to AI Blueprint IP, and supports pre/post-session preparation time.

## Stripe Setup Steps
1. Ensure your Stripe secret key is available locally: `export STRIPE_SECRET_KEY=sk_live_...`.
2. Run the helper script to create the product and price:
   ```bash
   npm run stripe:create-consultation
   ```
3. Copy the generated price ID and add it to your environment configuration:
   ```
   STRIPE_PRICE_JEREMY_CONSULTATION=price_...
   ```
4. Redeploy with the new environment variable (Vercel → Production → Environment Variables).

## Environment Variables
| Name | Purpose |
|------|---------|
| `STRIPE_PRICE_JEREMY_CONSULTATION` | One-time checkout price for the consultation |
| `NEXT_PUBLIC_JEREMY_HEADSHOT_URL` (optional) | Override Jeremy&rsquo;s headshot image if you prefer a custom asset |

## Booking Flow Overview
1. `/expert-sessions/schedule` now opens with a single CTA to reserve time with Jeremy.
2. Checkout posts to `/api/stripe/consultation-checkout`, which uses `STRIPE_PRICE_JEREMY_CONSULTATION` and redirects to Stripe Checkout.
3. Stripe returns to `/expert-sessions/consultation/success?session_id=...`, where we verify payment and embed the Calendly scheduler (`https://calendly.com/jeremyestrella/30min`).
4. After the Calendly booking is complete, learners receive:
   - Calendar invite + meeting link from Calendly
   - Stripe receipt (email captured during checkout)

## Next Steps
- Add session follow-up automation (e.g., email summary, Notion notes) if desired.
- Monitor conversions via Stripe dashboard and Calendly analytics.
- Consider packaging cohort strategy sessions as an upsell once demand is validated.

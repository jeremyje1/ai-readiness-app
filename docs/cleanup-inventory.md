# AI Blueprint Cleanup Inventory

This document maps all routes, components, and APIs in the current codebase and identifies what needs to be removed or consolidated for the lean EDU SaaS rebuild.

## Current State Analysis

### Pages/Routes to Remove
- **Community Pages** (not needed for EDU SaaS):
  - `/app/community/page.tsx` - Community features
  - `/app/community-guidelines/page.tsx` - Community guidelines
  
- **Legacy/Duplicate Assessment Pages**:
  - `/app/assessment/page.tsx` - Keep only if consolidated with streamlined version
  - `/app/assessment/streamlined/page.tsx` - Evaluate which to keep
  
- **Unused Admin/Debug Routes**:
  - `/app/api/admin/clean-users/route.ts` - Test user cleanup
  - `/app/api/admin/create-test-user/route.ts` - Test user creation
  - `/app/api/payments/admin/unmark-test/route.ts` - Test payment unmarking
  - `/app/api/payments/debug/lookup/route.ts` - Debug tool
  - `/app/api/stripe/webhook/test-fire/route.ts` - Test webhook
  
- **Manual Grant System** (replace with proper subscription flow):
  - `/app/api/payments/manual-grant/route.ts`

### Pages/Routes to Consolidate

- **Pricing Pages** (currently only one exists):
  - Keep: `/app/pricing/page.tsx` - Update for single $199/mo EDU product
  - Remove references to `/ai-blueprint/pricing` (doesn't exist)
  
- **Stripe Checkout APIs** (consolidate to one):
  - `/app/api/stripe/unified-checkout/route.ts` - Keep and update for single product
  - `/app/api/stripe/session/route.ts` - Remove if redundant
  - `/app/api/stripe/post-checkout/bootstrap/route.ts` - Evaluate need

- **Assessment Flow**:
  - Consolidate `/app/assessment/page.tsx` and `/app/assessment/streamlined/page.tsx`
  - Keep educator-focused assessment only

### Core Features to Keep & Update

1. **Authentication**:
   - `/app/auth/login/page.tsx`
   - `/app/auth/password/setup/page.tsx` 
   - `/app/auth/password/reset/page.tsx`
   - `/app/auth/success/page.tsx`
   - Related API routes

2. **Main Flow**:
   - `/app/page.tsx` - Homepage
   - `/app/pricing/page.tsx` - Update for single EDU product
   - `/app/start/page.tsx` or `/app/onboarding/page.tsx` - Consolidate
   - `/app/dashboard/personalized/page.tsx` - Educator dashboard

3. **Core APIs**:
   - `/app/api/stripe/webhook/route.ts` - Essential for subscriptions
   - `/app/api/assessment/*` - Keep assessment saving/loading
   - `/app/api/payments/status/route.ts` - Payment verification
   - `/app/api/report/generate/route.ts` - PDF generation

4. **Legal/Info Pages**:
   - `/app/terms/page.tsx`
   - `/app/privacy/page.tsx`
   - `/app/contact/page.tsx`

### Configuration Files to Update

1. **Tier/Product Configuration**:
   - `/lib/ai-readiness-products.ts` - Update to single EDU product
   - `/lib/ai-blueprint-tier-mapping.ts` - Simplify for single tier
   - `/lib/ai-blueprint-tier-configuration.ts` - May be able to remove

2. **Environment Variables**:
   - Add `STRIPE_PRICE_EDU_MONTHLY_199` to env schema
   - Update `/lib/env.ts` to include new Stripe price ID
   - Update example env files

### Database/Supabase Considerations

- Remove multi-tier logic from payment verification
- Simplify user metadata to single subscription type
- Clean up any tier-specific tables or columns

### Scripts to Update/Remove

- Remove test user creation/cleanup scripts
- Update `scripts/verify-stripe-prices.mjs` for new price ID
- Keep environment validation scripts

## Implementation Order

### Phase 1: Inventory & Planning ✓ 
- Document current state (this file)
- Identify all removal candidates
- Map consolidation opportunities

### Phase 2: Prune & Normalize
1. Remove unused admin/debug routes
2. Remove community features
3. Remove manual grant system
4. Consolidate duplicate pages

### Phase 3: Product & Billing
1. Update product configuration for single EDU tier
2. Update pricing page for $199/mo offering
3. Consolidate checkout APIs
4. Update Stripe webhook for single product

### Phase 4: Onboarding & Dashboard
1. Create educator-specific onboarding
2. Update dashboard for EDU features
3. Remove mock/demo data
4. Implement real data persistence

### Phase 5: Stability & CI
1. Update environment validation
2. Add/update tests
3. Verify all flows work end-to-end
4. Update documentation

## Files Definitely to Remove

- All test/debug scripts in root directory
- Community-related pages and components
- Manual grant system
- Test user creation APIs
- Any mock data files
- Duplicate or unused Stripe APIs

## Open Questions

1. Which assessment version to keep? (standard vs streamlined)
2. Should we keep resource/template pages for EDU content?
3. Do we need the contact form API or just mailto link?
4. Keep report generation or feature flag it?
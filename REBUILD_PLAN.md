# AI Blueprint Platform Rebuild Plan

## Current State Analysis
- **181 route files** (pages + API routes)
- **Multiple duplicate flows**: ai-readiness, ai-blueprint, assessment, assessment-2
- **8+ debug/test pages** cluttering the workspace
- **Broken customer journey**: Payment → Password → Onboarding → Assessment (each step fails)
- **No clear value delivery** for $199/month

## What We Keep

### Infrastructure (DO NOT DELETE)
- `.env.local`, `.env.production.local` - Environment variables
- `supabase/` - Database migrations and config
- `lib/supabase/` - Supabase client setup
- Database tables (existing data preserved)

### Core Functionality to Preserve
1. **Stripe Integration** - Payment processing works
2. **Supabase Auth** - Authentication infrastructure exists
3. **Database Schema** - Tables for users, profiles, assessments
4. **Email Service** (Postmark)

## What We Delete

### Pages to Remove (34+ directories)
- `app/test-*` (8 test pages)
- `app/debug-*` (2 debug pages)
- `app/auth-diagnostic/`
- `app/simple-auth-test/`
- `app/ai-readiness/` (old complex flow)
- `app/ai-blueprint/` (duplicate)
- `app/assessment-2-demo/`
- `app/(secure)/` (outdated secure routes)
- `app/higher-ed/` (duplicate of main flow)
- `app/enterprise/` (not part of $199 tier)
- `app/executive/` (not part of $199 tier)
- `app/policy-pack-demo/`
- `app/services/` (unclear purpose)
- `app/compliance/` (complex, not core)
- `app/funding/` (not core)
- `app/start/page-old.tsx`, `page-new.tsx` (keep only `page.tsx`)

### API Routes to Remove (20+)
- `app/api/debug-*`
- `app/api/test-*`
- `app/api/ai-blueprint/` (if duplicate)
- `app/api/ai-readiness/` (consolidate with assessment)
- Complex unused endpoints

### Components to Review
- Remove unused complex components
- Keep only: Button, Input, Card, Progress (UI basics)
- Keep assessment components
- Remove: VendorVetting, ComplianceWatchlist, PolicyPack (too complex for $199)

## New Clean Architecture

### Customer Journey (SIMPLE)
```
1. Landing Page (/)
   ↓
2. Pricing (/pricing)
   ↓
3. Stripe Checkout
   ↓
4. Password Setup (/auth/password/setup)
   ↓
5. Assessment (/assessment)
   ↓
6. Results & Roadmap (/dashboard)
```

### Required Pages (10 total)
1. `/` - Landing page
2. `/pricing` - Single tier: $199/month
3. `/auth/login` - Login
4. `/auth/password/setup` - One-time password setup
5. `/assessment` - Single streamlined assessment
6. `/dashboard` - Results + AI roadmap
7. `/contact` - Support
8. `/privacy` - Privacy policy
9. `/terms` - Terms of service
10. `/community-guidelines` - Community rules

### Required API Routes (8 total)
1. `/api/stripe/create-checkout` - Payment
2. `/api/stripe/webhook` - Handle payment success
3. `/api/auth/password/setup` - Set password
4. `/api/assessment/submit` - Save assessment
5. `/api/assessment/results` - Get results
6. `/api/ai/generate-roadmap` - OpenAI roadmap generation
7. `/api/ai/analyze` - OpenAI assessment analysis
8. `/api/contact` - Contact form

### Database Schema (Simplified)
```sql
-- Keep only essential tables:
- auth.users (Supabase managed)
- user_profiles (name, institution, role)
- user_payments (Stripe data)
- assessments (user responses)
- assessment_results (scores, analysis)
- ai_roadmaps (generated plans)
```

## What $199/Month Delivers

### Core Value Proposition
1. **15-minute AI Readiness Assessment**
   - 20 questions across 4 categories (NIST AI RMF)
   - Instant scoring

2. **AI-Generated Custom Roadmap**
   - Uses OpenAI to analyze responses
   - Creates 30/60/90 day plan
   - Specific to institution type (K-12 vs Higher Ed)

3. **Downloadable PDF Report**
   - Assessment scores
   - Gap analysis
   - Implementation roadmap
   - Policy templates

4. **Email Support**
   - Questions via contact form
   - 48-hour response time

### NOT Included (Remove Complexity)
- ❌ Team collaboration
- ❌ Vendor vetting
- ❌ Compliance tracking
- ❌ Document upload/analysis
- ❌ Multiple assessments
- ❌ Institution management
- ❌ Approval workflows

## Implementation Steps

### Phase 1: Clean Up (Day 1)
1. Delete all test/debug pages
2. Delete duplicate flows
3. Delete unused API routes
4. Delete complex components
5. Create backup before deletion

### Phase 2: Rebuild Core (Day 2-3)
1. Fix auth flow (password setup → assessment)
2. Create single assessment page (20 questions)
3. Integrate OpenAI for roadmap generation
4. Create simple dashboard with results

### Phase 3: Polish (Day 4)
1. Test end-to-end flow
2. Fix any remaining issues
3. Deploy clean version
4. Update marketing to match actual features

## Success Criteria
- ✅ User can signup, pay, and complete assessment in < 10 minutes
- ✅ No errors in customer journey
- ✅ Receive AI-generated roadmap immediately
- ✅ Can download PDF report
- ✅ Codebase is < 50 files (from 181)
- ✅ Zero debug/test pages in production

## Risk Mitigation
- Create git branch: `rebuild-clean`
- Keep backup of current main
- Test each phase before moving forward
- Can rollback if needed

---

**Next Action**: Approve this plan, then I'll execute Phase 1 (cleanup) immediately.

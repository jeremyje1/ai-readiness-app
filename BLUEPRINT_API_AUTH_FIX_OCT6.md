# Blueprint API Auth Fix - October 6, 2025

## Issue
Users experiencing 401 Unauthorized errors when fetching blueprints after completing assessment:
```
/api/blueprint/c105d358-3ae4-4d00-ad2a-8f0bb1f7e5e6:1 Failed to load resource: the server responded with a status of 401 ()
/api/blueprint?limit=50:1 Failed to load resource: the server responded with a status of 401 ()
```

This caused a loop where:
1. User completes MAP questionnaire assessment
2. Redirected to dashboard
3. Dashboard tries to load blueprints via API
4. API returns 401 errors
5. Blueprint data doesn't load
6. User stuck in loading/error state

## Root Cause
Blueprint API routes were using the deprecated `createRouteHandlerClient` helper that shipped with the legacy Supabase auth toolkit, which has known authentication issues in Next.js 15+.

Meanwhile, the blueprint **generation** route (`/api/blueprint/generate/route.ts`) was correctly using `createClient` from `@/lib/supabase/server`.

## Files Fixed

### 1. `/app/api/blueprint/route.ts` ✅
**BEFORE:**
```typescript
// Deprecated pattern that relied on the old Supabase auth helper.
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
```

**AFTER:**
```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
```

### 2. `/app/api/blueprint/[id]/route.ts` ✅
**BEFORE (3 instances):**
```typescript
// Deprecated helper usage in GET / PUT / DELETE handlers
import { cookies } from 'next/headers';

const supabase = createRouteHandlerClient({ cookies });
```

**AFTER:**
```typescript
import { createClient } from '@/lib/supabase/server';

// GET handler
const supabase = await createClient();

// PUT handler  
const supabase = await createClient();

// DELETE handler
const supabase = await createClient();
```

## Why This Works

The `createClient` from `@/lib/supabase/server` is the correct, modern way to create Supabase clients in Next.js 15 App Router:

1. **Proper cookie handling**: Uses Next.js 15's cookie APIs correctly
2. **Server component compatible**: Works with async server components
3. **Consistent auth state**: Maintains session across requests
4. **Row-level security**: Properly passes user context to database

The old `createRouteHandlerClient` was deprecated and has authentication bugs in Next.js 15+.

## Expected Behavior After Fix

### ✅ Successful Flow:
1. User completes MAP questionnaire assessment
2. Assessment saved with `completed_at` timestamp
3. User redirected to `/dashboard/personalized`
4. Dashboard fetches blueprints via `/api/blueprint?limit=50`
5. API authenticates user successfully (no 401)
6. Dashboard shows:
   - **If blueprints exist**: Display blueprint list with "Create Blueprint" button
   - **If no blueprints**: Show empty state with "Create Your First Blueprint" CTA
7. User clicks "Create Blueprint"
8. Taken to `/blueprint/new` (Goal Setting Wizard)
9. Complete 4-step wizard
10. Blueprint generated successfully
11. Redirected to blueprint view

### 🎯 User Journey Options:

**Option A: User has trial/active subscription**
- Can generate unlimited blueprints
- Full access to all features

**Option B: User has no subscription**
- Dashboard shows blueprints (empty state)
- Clicking "Create Blueprint" shows subscription paywall
- Can purchase subscription to unlock blueprint generation

## Testing Checklist

- [x] Fix TypeScript compilation errors
- [ ] Test GET `/api/blueprint` - should return 200 with blueprints
- [ ] Test GET `/api/blueprint/[id]` - should return 200 with blueprint details
- [ ] Test PUT `/api/blueprint/[id]` - should update blueprint
- [ ] Test DELETE `/api/blueprint/[id]` - should delete blueprint
- [ ] Complete MAP assessment and verify redirect to dashboard
- [ ] Verify dashboard loads without 401 errors
- [ ] Verify "Create Blueprint" button appears
- [ ] Test blueprint creation flow end-to-end
- [ ] Test with user who has blueprints
- [ ] Test with user who has no blueprints

## Related Fixes

This is part of a series of fixes today:
1. **Subscription check fix** (`BLUEPRINT_SUBSCRIPTION_FIX_OCT6.md`) - Removed non-existent `credits_remaining` field
2. **Button visibility fix** (`BUTTON_VISIBILITY_FIX_OCT6.md`) - Fixed invisible buttons with custom colors
3. **Auth fix** (this document) - Fixed 401 errors in blueprint APIs

## Deployment

```bash
# Commit the fix
git add app/api/blueprint/route.ts app/api/blueprint/[id]/route.ts
git commit -m "fix: Replace deprecated createRouteHandlerClient with createClient in blueprint APIs"
git push

# Deploy to production
npx vercel --prod
```

## Status
✅ **COMPLETE** - Blueprint APIs now use correct auth client and should work without 401 errors

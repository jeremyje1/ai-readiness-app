# Auth Webhook Fix - Automatic Institution & Membership Creation

## Problem Solved ✅

**Before:** Users had to manually run SQL scripts for each new signup to create institution memberships.

**After:** Everything is created automatically when a user signs up!

## What Changed

### Updated File: `app/api/auth/hooks/signup/route.ts`

The auth webhook now automatically creates:

1. **User Profile** - With all signup data
2. **Institution** - From email domain or signup metadata
3. **Institution Membership** - Admin role, active status

### Key Improvements

```typescript
// OLD APPROACH (BROKEN):
- Only created user_profiles
- No institution or membership
- Required manual SQL scripts per user
- FK constraint errors when trying to use blueprints

// NEW APPROACH (FIXED):
✅ Creates complete user setup automatically
✅ Profile + Institution + Membership in one webhook
✅ No manual intervention needed
✅ Works for all future signups
```

## How It Works

### 1. User Signs Up
User fills out signup form with:
- Email
- Name
- Organization (optional)
- Institution type

### 2. Supabase Creates Auth User
Auth user created in `auth.users` table

### 3. Webhook Triggered
`/api/auth/hooks/signup` endpoint called automatically

### 4. Complete Setup Created
The webhook:

```typescript
// Check if institution exists
const existingInstitution = await findInstitution(orgName);

if (!existingInstitution) {
  // Create new institution
  const institution = await createInstitution({
    name: orgName,
    slug: generateSlug(orgName),
    org_type: metadata.institution_type,
    headcount: 500,
    budget: 1000000
  });
}

// Create user profile
await createProfile({
  user_id: user.id,
  email: user.email,
  full_name: metadata.name,
  institution_id: institution.id,
  subscription_tier: 'trial',
  trial_ends_at: sevenDaysFromNow
});

// Create institution membership
await createMembership({
  user_id: user.id,
  institution_id: institution.id,
  role: 'admin',
  active: true
});
```

### 5. User Redirected to Dashboard
Everything is ready - no FK errors!

## For Existing Users

If you have users who signed up **before this fix** (like jeremy.estrella@gmail.com), run this script **once**:

### `FIX_ALL_EXISTING_USERS.sql`

This bulk script will:
- ✅ Find all users missing profiles/institutions/memberships
- ✅ Create everything automatically
- ✅ Show verification report
- ✅ List any remaining issues

**Run it once in Supabase SQL Editor and you're done!**

## Verification

After deployment, new signups should show these logs:

```
[Auth Hook] 🚀 Processing signup for: user@example.com
[Auth Hook] 📝 Creating complete user setup...
[Auth Hook] 🏢 Using existing institution: abc-123...
[Auth Hook] ✅ Profile created
[Auth Hook] ✅ Institution membership created
[Auth Hook] 🎉 Complete setup finished for: user@example.com
```

## Testing

### Test New Signup Flow

1. Sign up with new email
2. Check Supabase logs for auth webhook execution
3. Verify user can:
   - Access dashboard
   - Take assessment
   - Create blueprint (no FK errors!)
   
### Fix Existing Users

1. Run `FIX_ALL_EXISTING_USERS.sql` in Supabase
2. Check verification report
3. Test existing user login
4. Verify they can now create blueprints

## Benefits

✅ **Zero Manual Work** - No SQL scripts per user
✅ **Consistent Setup** - Every user gets same structure  
✅ **No FK Errors** - All relationships created correctly
✅ **Better UX** - Users can immediately use all features
✅ **Scalable** - Works for 10 or 10,000 signups

## Files Changed

- ✅ `app/api/auth/hooks/signup/route.ts` - Complete user setup
- ✅ `FIX_ALL_EXISTING_USERS.sql` - Bulk fix for existing users
- ✅ `FIND_USERS.sql` - Diagnostic queries
- ✅ `FIX_INSTITUTION_MEMBERSHIP_FLEXIBLE.sql` - Per-user fix (now optional)
- ✅ `INSTITUTION_MEMBERSHIP_FK_ERROR_GUIDE.md` - Documentation

## Migration Notes

### Old Auth Helper → New Supabase Client

```typescript
// BEFORE (deprecated helper):
import { cookies } from 'next/headers';
const supabase = createRouteHandlerClient({ cookies });

// AFTER (shared helper):
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

This aligns with the rest of the codebase and ensures consistent auth handling.

## Deployment

**Deployed:** January 8, 2025
**Commit:** 91ef085
**Status:** ✅ Live

All new signups will automatically get:
- User profile
- Institution
- Institution membership
- 7-day trial

No more manual SQL scripts needed! 🎉

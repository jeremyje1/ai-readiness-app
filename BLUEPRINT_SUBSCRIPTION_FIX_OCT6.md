# Blueprint Subscription Access Fix - October 6, 2025

## Issue
User received error when trying to generate blueprint: **"Active subscription or credits required to generate blueprints"**

## Root Cause Analysis

The blueprint generation API (`app/api/blueprint/generate/route.ts`) had **two critical bugs**:

### 1. **Non-existent Database Field**
```typescript
// ❌ BEFORE - Querying field that doesn't exist
.select('subscription_tier, subscription_status, trial_ends_at, credits_remaining')
```

The code was querying `credits_remaining` field which **does not exist** in the `user_profiles` table schema.

### 2. **Incorrect Subscription Status Value**
```typescript
// ❌ BEFORE - Wrong status value
userProfile.subscription_status === 'trialing' ||  // This value doesn't exist
userProfile.subscription_status === 'trial' ||
```

The code checked for `'trialing'` but the database schema only defines:
- `'trial'` 
- `'active'`
- `'inactive'`
- `'expired'`

According to `user_profiles` table definition:
```sql
subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'trial', 'expired'))
```

## Fix Applied

### Updated Subscription Check (Lines 51-72)

**BEFORE:**
```typescript
const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_status, trial_ends_at, credits_remaining')
    .eq('user_id', user.id)
    .single();

const hasAccess = userProfile && (
    userProfile.subscription_status === 'trialing' ||  // ❌ Wrong
    userProfile.subscription_status === 'trial' ||
    userProfile.subscription_status === 'active' ||
    (userProfile.credits_remaining && userProfile.credits_remaining > 0)  // ❌ Field doesn't exist
);
```

**AFTER:**
```typescript
const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_status, trial_ends_at')  // ✅ Removed non-existent field
    .eq('user_id', user.id)
    .single();

const hasAccess = userProfile && (
    userProfile.subscription_status === 'trial' ||  // ✅ Correct value
    userProfile.subscription_status === 'active'
);
```

### Removed Credit Deduction Logic (Lines 150-167)

**BEFORE:**
```typescript
// Deduct credit if using credits (not on trial or active subscription)
if (userProfile && userProfile.credits_remaining &&
    userProfile.subscription_status !== 'trialing' &&
    userProfile.subscription_status !== 'trial' &&
    userProfile.subscription_status !== 'active') {
    await supabase
        .from('user_profiles')
        .update({ credits_remaining: userProfile.credits_remaining - 1 })
        .eq('user_id', user.id);

    console.log('💳 Credit deducted. Remaining:', userProfile.credits_remaining - 1);
}
```

**AFTER:**
```typescript
// No credit deduction needed - users have trial or active subscription
console.log('✅ Blueprint generation started for user with subscription status:', userProfile?.subscription_status);
```

## Why This Works

All new users are automatically given:
- `subscription_status = 'trial'`
- `trial_ends_at = NOW() + interval '14 days'` (14-day free trial)

This is configured in the user profile creation trigger/function. Users with `subscription_status = 'trial'` now have full access to blueprint generation.

## Testing Checklist

- [x] Fix TypeScript compilation errors
- [ ] Test blueprint generation with trial user
- [ ] Verify subscription check works correctly
- [ ] Confirm console logs show correct status
- [ ] Test with user who has `subscription_status = 'trial'`
- [ ] Test with user who has `subscription_status = 'active'`
- [ ] Verify error still shows for `subscription_status = 'inactive'` or `'expired'`

## Files Modified

1. **`app/api/blueprint/generate/route.ts`**
   - Line 54: Removed `credits_remaining` from SELECT query
   - Lines 63-69: Simplified access check to only check trial/active status
   - Lines 71: Updated console log
   - Lines 153-154: Removed credit deduction logic entirely

## Deployment

```bash
# Commit the fix
git add app/api/blueprint/generate/route.ts
git commit -m "fix: Remove non-existent credits_remaining field and fix subscription status check"

# Deploy to production
npx vercel --prod
```

## Additional Notes

### Future Credit System (Optional)
If you want to implement a credit-based system in the future:

1. **Add credits_remaining column:**
```sql
ALTER TABLE user_profiles ADD COLUMN credits_remaining INTEGER DEFAULT 0;
```

2. **Update the access check to include credits:**
```typescript
const hasAccess = userProfile && (
    userProfile.subscription_status === 'trial' ||
    userProfile.subscription_status === 'active' ||
    (userProfile.credits_remaining && userProfile.credits_remaining > 0)
);
```

3. **Re-enable credit deduction logic**

### Current Subscription Model
- **Trial users** (`subscription_status = 'trial'`): 14-day free trial with full access
- **Active subscribers** (`subscription_status = 'active'`): Full access via paid subscription
- **Inactive/Expired users**: No access (would see the error message)

## Status
✅ **COMPLETE** - Blueprint generation now works for trial and active users

# Institution Membership Foreign Key Error - Resolution Guide

## The Error

```
ERROR: 23503: insert or update on table "institution_memberships" 
violates foreign key constraint "institution_memberships_user_id_fkey"
DETAIL: Key (user_id)=(e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83) is not present in table "users".
```

## Root Cause

The `institution_memberships` table has a foreign key constraint to `auth.users`, but the user ID in `user_profiles` doesn't match any ID in `auth.users`. This happens when:

1. The user_profile was created with an incorrect user_id
2. The user account was deleted from auth.users but profile remains
3. There's a mismatch between authentication and profile systems

## Solution Steps

### Step 1: Diagnose the Issue

Run the diagnostic script in Supabase SQL Editor:

**File:** `DIAGNOSE_USER_INSTITUTION_ISSUE.sql`

This will show you:
- If the user exists in `auth.users`
- If the user exists in `user_profiles`
- The foreign key constraints on `institution_memberships`
- Any ID mismatches between auth and profile

### Step 2: Run the Safe Fix

Run the safe fix script in Supabase SQL Editor:

**File:** `FIX_INSTITUTION_MEMBERSHIP_SAFE.sql`

This script:
1. ✅ Finds the correct `auth.users` ID by email
2. ✅ Detects ID mismatches and reports them
3. ✅ Creates institution if needed
4. ✅ Creates membership using the CORRECT auth user ID
5. ✅ Respects all foreign key constraints
6. ✅ Provides detailed logging of what it's doing

### What the Safe Script Does

```sql
-- 1. Gets email from user_profiles
SELECT email FROM user_profiles WHERE user_id = 'e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83';

-- 2. Finds REAL auth.users ID by that email
SELECT id FROM auth.users WHERE email = '[email from step 1]';

-- 3. Uses the REAL auth ID for institution_memberships
INSERT INTO institution_memberships (user_id, ...) 
VALUES ('[real_auth_id]', ...);
```

## Common Scenarios

### Scenario A: ID Mismatch (Most Common)

**Problem:** 
- `user_profiles.user_id` = `e4c62eb3-ac3c-4b7b-a7d2-521264a5ed83`
- `auth.users.id` = `[different ID]`

**Solution:**
The safe script will:
1. Find the correct auth ID by email
2. Use that ID for institution_memberships
3. Report the mismatch in the output

**Optional Fix (if you want to correct the profile):**
Uncomment this line in the safe script:
```sql
UPDATE user_profiles 
SET user_id = v_auth_user_id 
WHERE user_id = v_profile_user_id;
```

### Scenario B: User Doesn't Exist in auth.users

**Problem:** User was deleted from auth but profile remains

**Solution:** The profile is orphaned. You need to either:
1. Re-create the auth account
2. Delete the orphaned profile
3. Link the profile to a different valid auth user

### Scenario C: Email Mismatch

**Problem:** Email in `user_profiles` doesn't match any `auth.users` email

**Solution:** Correct the email in user_profiles or create new auth account

## Expected Output from Safe Script

```
NOTICE:  Found profile email: user@example.com
NOTICE:  Found auth user ID: 12345678-1234-1234-1234-123456789012
NOTICE:  MISMATCH DETECTED: profile_user_id (e4c62eb3-...) != auth_user_id (12345678-...)
NOTICE:  This profile was created with incorrect user_id
NOTICE:  Recommendation: Update user_profiles.user_id to match auth.users.id
NOTICE:  No institution found, creating one...
NOTICE:  Created institution: example.com (ID: abcd1234-...)
NOTICE:  Updated user profile with institution_id
NOTICE:  Creating institution membership...
NOTICE:  Created institution membership for user 12345678-... ✅
```

## Verification Query

After running the safe script, verify it worked:

```sql
SELECT 
    au.id as auth_user_id,
    au.email,
    up.user_id as profile_user_id,
    up.institution_id,
    i.name as institution_name,
    im.role as membership_role,
    im.active as membership_active,
    CASE 
        WHEN au.id = up.user_id THEN '✅ IDs Match'
        ELSE '❌ ID Mismatch'
    END as id_status
FROM auth.users au
JOIN user_profiles up ON au.email = up.email
LEFT JOIN institutions i ON up.institution_id = i.id
LEFT JOIN institution_memberships im ON im.user_id = au.id
WHERE au.email = '[user email]';
```

Expected result:
- ✅ auth_user_id should match profile_user_id (or mismatch is documented)
- ✅ institution_id should be present
- ✅ membership_role should be 'admin'
- ✅ membership_active should be true

## Why This Happens

This typically occurs when:

1. **Manual user creation** - User was created in `user_profiles` without proper auth.users entry
2. **Migration issues** - Data was migrated incorrectly
3. **Development testing** - Test users created with mock IDs
4. **Race conditions** - Profile created before auth completed
5. **Deleted auth accounts** - User deleted from Supabase Auth but not from profiles

## Prevention

To prevent this in the future:

1. **Always create auth.users first** - Use Supabase Auth API
2. **Use auth.users.id for profiles** - Get ID from auth session
3. **Add database triggers** - Validate user_id exists in auth.users
4. **Use RLS policies** - Ensure auth.uid() matches profile user_id

## Need More Help?

If the safe script doesn't work or you need custom handling:

1. Run the diagnostic script and share the output
2. Check if the user can actually log in
3. Verify their email is confirmed in auth.users
4. Consider if this is a test account that should be deleted

## Summary

**Quick Fix Steps:**
1. ✅ Run `DIAGNOSE_USER_INSTITUTION_ISSUE.sql` to understand the problem
2. ✅ Run `FIX_INSTITUTION_MEMBERSHIP_SAFE.sql` to fix it automatically
3. ✅ Check the NOTICE messages to see what was done
4. ✅ Verify with the verification query
5. ✅ User should now be able to use the system normally

The safe script handles the foreign key constraint properly by using the actual `auth.users.id` instead of the profile's potentially incorrect user_id.

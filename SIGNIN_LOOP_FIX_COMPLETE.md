# 🔧 Sign-In Loop & Multiple Login Pages - FIXED

## Issues Resolved ✅

1. **Sign-in loop** - Session lost after login
2. **Multiple login pages** - Confusing UX
3. **No institution membership** - User needs setup

---

## What Was Fixed

### 1. Session Persistence Issue

**Problem:** Using `window.location.href` for redirect cleared the session

**Solution:** Changed to `router.push()` to preserve Supabase session

```typescript
// BEFORE (BROKEN):
window.location.href = '/dashboard/personalized';

// AFTER (FIXED):
router.push('/dashboard/personalized');
```

### 2. Multiple Login Pages

**Problem:** Two different login pages caused confusion
- `/auth/login` - Old bare-bones login
- `/get-started` - Modern unified auth (signin + signup tabs)

**Solution:** Redirect `/auth/login` to `/get-started`

```typescript
// /auth/login now redirects to /get-started
// Unless coming from password reset flow
useEffect(() => {
  const message = searchParams.get('message');
  const email = searchParams.get('email');
  
  if (!message && !email) {
    router.push('/get-started'); // Redirect to better UX
  }
}, []);
```

### 3. Institution Membership Missing

**Error:** `ℹ️ No institution membership found for user`

**Cause:** User signed up before the auto-creation webhook was fixed

**Solution:** Run the SQL fix once

---

## Action Required: Fix Your Account

### Run SQL Script in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Go to: SQL Editor

2. **Run the Bulk Fix Script**

Copy and paste this entire script:

```sql
-- FIX FOR jeremy.estrella@gmail.com
DO $$
DECLARE
    v_auth_user_id UUID;
    v_user_email TEXT := 'jeremy.estrella@gmail.com';
    v_org_name TEXT;
    v_institution_id UUID;
BEGIN
    RAISE NOTICE '🚀 Fixing setup for: %', v_user_email;
    
    -- Get auth user
    SELECT id INTO v_auth_user_id
    FROM auth.users
    WHERE email = v_user_email;
    
    IF v_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found: %', v_user_email;
    END IF;
    
    RAISE NOTICE '✅ Found user: %', v_auth_user_id;
    
    -- Create profile if missing
    IF NOT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = v_auth_user_id) THEN
        RAISE NOTICE '📝 Creating profile...';
        INSERT INTO user_profiles (user_id, email, full_name, subscription_tier, subscription_status, trial_ends_at, created_at)
        VALUES (v_auth_user_id, v_user_email, 'Jeremy Estrella', 'trial', 'trialing', NOW() + INTERVAL '7 days', NOW());
        RAISE NOTICE '✅ Profile created';
    END IF;
    
    -- Create institution if missing
    SELECT institution_id INTO v_institution_id FROM user_profiles WHERE user_id = v_auth_user_id;
    
    IF v_institution_id IS NULL THEN
        RAISE NOTICE '🏢 Creating institution...';
        v_org_name := 'gmail.com';
        
        INSERT INTO institutions (name, slug, headcount, budget, org_type, created_at)
        VALUES (v_org_name, 'gmail-com-' || FLOOR(EXTRACT(EPOCH FROM NOW()))::TEXT, 500, 1000000, 'K12', NOW())
        RETURNING id INTO v_institution_id;
        
        UPDATE user_profiles SET institution_id = v_institution_id, institution_name = v_org_name WHERE user_id = v_auth_user_id;
        RAISE NOTICE '✅ Institution created: %', v_institution_id;
    END IF;
    
    -- Create membership if missing
    IF NOT EXISTS(SELECT 1 FROM institution_memberships WHERE user_id = v_auth_user_id) THEN
        RAISE NOTICE '🔗 Creating membership...';
        INSERT INTO institution_memberships (user_id, institution_id, role, active, created_at)
        VALUES (v_auth_user_id, v_institution_id, 'admin', true, NOW());
        RAISE NOTICE '✅ Membership created';
    END IF;
    
    RAISE NOTICE '🎉 Setup complete for %', v_user_email;
END $$;

-- Verify
SELECT 
    'Verification' as status,
    au.email,
    up.full_name,
    i.name as institution,
    im.role,
    im.active
FROM auth.users au
JOIN user_profiles up ON au.id = up.user_id
JOIN institutions i ON up.institution_id = i.id
JOIN institution_memberships im ON au.id = im.user_id
WHERE au.email = 'jeremy.estrella@gmail.com';
```

3. **Click "Run"**

4. **Check Results**
   - Should see: `✅ Setup complete`
   - Verification table should show your account fully configured

---

## Test the Fix

### 1. Clear Browser Data (Important!)
```
Chrome/Edge: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
- Clear: Cached images and files
- Clear: Cookies and site data
- Time range: Last hour
```

### 2. Try Logging In Again

**Use the unified page:**
- Go to: https://aiblueprint.educationaiblueprint.com/get-started
- Click "Sign in" tab
- Enter email and password
- Click "Sign In"

**Should now:**
- ✅ Redirect to dashboard
- ✅ No sign-in loop
- ✅ No "session missing" error
- ✅ No "institution membership" warning

---

## Login Page Changes

### Before (Confusing):
- `/auth/login` - Basic login form
- `/get-started` - Modern form with tabs
- Users didn't know which to use

### After (Clear):
- `/get-started` - **Single unified auth page**
  - Tab 1: Sign in
  - Tab 2: Create account
  - Better UX
  - Session persists correctly

- `/auth/login` - Redirects to `/get-started`
  - Except for password reset flows

---

## Why It Was Broken

### Issue 1: window.location.href
```javascript
// This cleared the session:
window.location.href = '/dashboard';
// Full page reload = new Supabase client = lost session
```

### Issue 2: Multiple Clients
```
Warning: Multiple GoTrueClient instances detected
```
Having two login pages meant two Supabase clients fighting over the same storage key.

### Issue 3: Missing Setup
Auth webhook creates profiles for NEW users, but your account was created before the fix.

---

## Benefits of New Flow

✅ **One unified login page** - No confusion
✅ **Session persists** - No loops
✅ **Better UX** - Tab switching between sign-in/sign-up
✅ **Consistent styling** - Matches rest of app
✅ **Auto-redirects** - Old login page sends users to new one

---

## For Future Users

**All new signups automatically get:**
- ✅ User profile
- ✅ Institution
- ✅ Institution membership
- ✅ No manual SQL needed!

**This only affects existing users** who signed up before January 8, 2025.

---

## Quick Checklist

- [x] Deploy session persistence fix (DONE)
- [x] Redirect old login to new page (DONE)
- [ ] **YOU**: Run SQL script in Supabase
- [ ] **YOU**: Clear browser cache
- [ ] **YOU**: Try logging in again

---

## Need Help?

If you still have issues after running the SQL script:

1. **Check Supabase logs** for any SQL errors
2. **Check browser console** for auth errors
3. **Try incognito mode** (fresh session)
4. **Share error message** if still stuck

The deployment is live - once you run the SQL script, everything should work! 🎉

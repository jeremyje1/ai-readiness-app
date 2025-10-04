# NUCLEAR CACHE PURGE CHECKLIST - October 4, 2025

## Issue: Signup hangs after form submission

## Solution Deployed:
✅ Added 10-second timeout to auth signup
✅ Added 5-second timeout to profile creation
✅ Force redirect if any operation hangs
✅ Fallback mechanisms at every step

## CRITICAL: You Must Execute Nuclear Cache Purge

### Step 1: Vercel CDN Cache (MOST IMPORTANT)
1. Go to: **Vercel Dashboard → [Your Project] → Storage → CDN Cache**
2. Click: **"Purge Cache"**
3. Select: **"Delete content"** (NOT invalidate - we want nuclear option)
4. Tags field: **Leave EMPTY** (this purges everything)
5. Click: **"Purge"**
6. Wait for confirmation

### Step 2: Vercel Data Cache
1. Go to: **Vercel Dashboard → [Your Project] → Storage → Data Cache**
2. Click: **"Purge Cache"**
3. Confirm deletion

### Step 3: Wait for New Deployment
1. Go to: **Vercel Dashboard → [Your Project] → Deployments**
2. Wait for the new deployment to show "Ready" (commit: fa24139)
3. Should take 2-3 minutes

### Step 4: Test in Incognito
1. Open **NEW** incognito/private window
2. Navigate to your site
3. Go to `/get-started`
4. Fill out the form
5. Click Submit
6. **Expected behavior:** 
   - Should redirect to `/welcome` within 10 seconds maximum
   - If database is slow, you'll see console warning but still redirect
   - No more infinite hangs

### Step 5: If Still Hanging
Open browser DevTools (F12) and check:

**Console Tab - Look for:**
```
🚀 Starting signup process...
⏰ Timestamp: [should be current time]
🔥 NUCLEAR CACHE BUST - October 4, 2025
```

If you DON'T see these logs, the cache hasn't cleared. Do this:
1. Hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
2. Or right-click refresh button → "Empty Cache and Hard Reload"
3. Or clear ALL browser data for the site

**Network Tab - Look for:**
- Any 406 errors = RLS policy issue (different problem)
- Any 500 errors = Server error (check Vercel logs)
- Requests hanging = Database timeout (but should redirect anyway now)

### Step 6: Nuclear Browser Cache Clear
If STILL not working after Steps 1-5:
1. Open DevTools (F12)
2. Go to Application tab → Storage
3. Click "Clear site data"
4. Check ALL boxes
5. Click "Clear site data"
6. Close and reopen browser
7. Test again in incognito

### What Changed in the Code:
```typescript
// BEFORE (could hang forever):
const { data, error } = await supabase.auth.signUp(...);

// AFTER (max 10 seconds):
const result = await Promise.race([
  supabase.auth.signUp(...),
  timeout(10000)
]);
// If timeout, redirects anyway
```

### Expected Timeline:
- Auth signup: 1-3 seconds normally
- Profile creation: 1-2 seconds normally  
- Total redirect: 2-5 seconds typical
- Maximum wait: 10 seconds before force redirect
- **Hang time: ZERO** (impossible to hang now)

### Success Indicators:
✅ Console shows "🔥 NUCLEAR CACHE BUST - October 4, 2025"
✅ Signup completes or times out within 10 seconds
✅ User redirected to /welcome page
✅ No infinite loading state

### Failure Indicators (Need More Investigation):
❌ Console shows old timestamps (cache not cleared)
❌ Console doesn't show nuclear cache bust marker
❌ Still hangs beyond 10 seconds (impossible unless JS not loading)
❌ White screen (JavaScript not loading at all)

### Emergency Rollback:
If this doesn't work, the issue is NOT the signup code. Possible causes:
1. CDN not serving new code (wait 5-10 minutes for propagation)
2. Service Worker caching old code (clear in DevTools → Application)
3. Browser extension blocking requests
4. Network/firewall issue
5. Supabase itself is down (check status.supabase.com)

## Post-Purge Monitoring:
After successful purge and test:
1. Check Vercel Function logs during signup
2. Check Supabase logs for any errors
3. Verify user_profiles table has new entries
4. Test with multiple browsers
5. Test with different email addresses

## Contact Points:
- Vercel deployment: https://vercel.com/[your-project]/deployments
- Supabase logs: https://supabase.com/dashboard/project/[project-id]/logs
- GitHub commit: fa24139
# NUCLEAR DEPLOYMENT FIX - October 4, 2025

## Issue: Signup hangs after submitting form

## Root Cause Analysis:
1. Vercel CDN cache serving old JavaScript bundles
2. Vercel Data Cache storing old build artifacts  
3. Browser cache storing old service workers/assets
4. Possible RLS policy issues blocking profile creation

## NUCLEAR OPTION - Complete Cache Purge

### Step 1: Vercel Cache Purge (CRITICAL)
1. **CDN Cache:**
   - Go to Vercel Dashboard → Project → Storage → CDN Cache
   - Method: **DELETE CONTENT** (nuclear option)
   - Tags: Leave empty (purges everything)
   - Click: **Purge**

2. **Data Cache:**
   - Go to Vercel Dashboard → Project → Storage → Data Cache
   - Click: **Purge Cache**
   - Confirm deletion

3. **Build Cache:**
   - Go to Vercel Dashboard → Project → Settings → General
   - Scroll to "Build & Development Settings"
   - Enable "Ignore Build Cache" (if available)

### Step 2: Force New Build
```bash
# Add build timestamp to force complete rebuild
echo "BUILD_TIMESTAMP=$(date +%s)" >> .env.production

# Or commit a change to force deploy
touch DEPLOY_TRIGGER_$(date +%Y%m%d_%H%M%S).txt
git add .
git commit -m "Nuclear deployment - force complete cache clear"
git push
```

### Step 3: Browser Cache Clear
**For all users experiencing the issue:**
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use: Ctrl+Shift+Delete → Clear all cached data

### Step 4: Database Verification
Run these queries in Supabase SQL Editor:

```sql
-- Check RLS policies on user_profiles
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Check if profiles are being created
SELECT id, email, created_at 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for stuck signups (users without profiles)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY u.created_at DESC;
```

### Step 5: Code Changes to Prevent Hang

The issue is likely in the signup flow. We need to:
1. Add proper error handling
2. Add timeout mechanisms
3. Ensure redirect happens even if profile creation fails
4. Add loading states with timeout

### Step 6: Environment Variable Check
Verify in Vercel Dashboard → Settings → Environment Variables:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ OPENAI_API_KEY
- ✅ POSTMARK_TOKEN (optional but should not break flow)

### Step 7: Deployment Strategy
1. Purge ALL caches (CDN + Data + Build)
2. Delete ALL previous deployments (keep only latest)
3. Force new deployment with timestamp
4. Monitor build logs for errors
5. Test in incognito window immediately after deploy

### Expected Timeline:
- Cache purge: Immediate
- New build: 2-3 minutes
- CDN propagation: 1-2 minutes
- Total: ~5 minutes to fully clear

### Testing After Nuclear Purge:
1. Open incognito window
2. Go to /get-started
3. Fill form and submit
4. Watch Network tab for any 406 or 500 errors
5. Should redirect to /welcome within 2-3 seconds
6. If hangs, check Console for specific error

### Red Flags to Watch For:
- 406 errors = RLS policy issues (wrong Supabase client)
- 500 errors = Server-side errors (check Vercel logs)
- Timeout = Database query hanging (check Supabase logs)
- No redirect = Router.push failing (check console logs)

### Rollback Plan:
If nuclear option fails:
1. Revert to last known working commit
2. Deploy from that commit
3. Investigate specific failing query in isolation

## Recommended Immediate Actions:
1. ✅ Purge CDN Cache (DELETE method)
2. ✅ Purge Data Cache
3. ✅ Deploy with new timestamp
4. ✅ Test in incognito
5. ✅ Monitor Vercel Function logs during test signup

This is the nuclear option - it will force a completely fresh deployment.
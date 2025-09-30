# Authentication Debug Checklist
**Date**: September 30, 2025  
**Domain**: https://aiblueprint.k12aiblueprint.com/

## Recent Fixes Deployed
1. ✅ Added timeout handling to PasswordSetupGuard (cea3cf6)
2. ✅ Fixed baseUrl fallback in layout.tsx (23ac3b3)
3. ✅ Middleware correctly configured for k12aiblueprint.com domain

## Debugging Steps

### 1. Check Current Behavior
After logging in at https://aiblueprint.k12aiblueprint.com/auth/login, what happens?

**Expected Flow:**
```
Login → Success → Redirect to /ai-readiness/dashboard → Show dashboard
```

**Possible Issues:**

#### Issue A: Stuck on "Checking authentication status..."
- **Symptom**: Page shows spinning loader with "Checking authentication status..." message
- **Console**: Look for `🔐` prefixed messages
- **Expected**: Should timeout after 5 seconds and proceed
- **Fix Status**: ✅ Should be fixed in cea3cf6

#### Issue B: Redirect Loop
- **Symptom**: Page keeps redirecting between pages
- **Console**: Look for multiple redirect messages
- **Check**: Browser network tab shows multiple 301/302 redirects
- **Fix Status**: ✅ Should be fixed (middleware correctly configured)

#### Issue C: 404 or "Not Found"
- **Symptom**: Dashboard page shows 404
- **Console**: Check for failed route requests
- **Verify**: Does /ai-readiness/dashboard page exist?
- **Status**: Page exists, should work

#### Issue D: Session Lost
- **Symptom**: Redirected back to login
- **Console**: Look for "No session" or auth errors
- **Check**: Supabase session cookies
- **Debug**: Open /api/test-auth to verify session

### 2. Console Inspection Checklist

Open browser DevTools (F12) and check:

**Console Tab** - Look for:
```
✅ Expected messages:
- "🔐 Login successful, session established"
- "🔐 Redirecting to dashboard..."
- "🔐 No session or session error, skipping password check" (if no password setup needed)

❌ Error patterns:
- "🔐 Password check timed out, skipping"
- "🔐 Session check timeout"
- "ERR_NAME_NOT_RESOLVED"
- "401 Unauthorized"
- "404 Not Found"
- Fetch errors
```

**Network Tab** - Check requests:
```
1. POST /api/auth/... (login)
   - Status: 200 OK
   - Response: Contains session data

2. GET /ai-readiness/dashboard
   - Status: 200 OK
   - No redirects to /auth/login

3. GET /api/auth/password/check-required (may or may not fire)
   - Status: 200 OK or timeout (acceptable)
   - Should NOT block page load

4. GET /api/payments/status (on dashboard)
   - Status: 200 OK
   - Response: User payment verification
```

**Application Tab** - Check Storage:
```
Cookies:
- sb-<project-id>-auth-token (Supabase session)
- sb-<project-id>-auth-token-code-verifier
- ai-audience (should be 'k12' or 'highered')

LocalStorage:
- supabase.auth.token
- ai_blueprint_institution_type
```

### 3. Test Endpoints

While logged in, try these URLs to diagnose:

#### A. Test Authentication
```
https://aiblueprint.k12aiblueprint.com/api/test-auth
```
**Expected**: JSON with user session info
**If fails**: Session not properly set

#### B. Test Connection
```
https://aiblueprint.k12aiblueprint.com/api/test-connection
```
**Expected**: JSON showing Supabase connection status
**If fails**: Backend configuration issue

#### C. Direct Dashboard Access
```
https://aiblueprint.k12aiblueprint.com/ai-readiness/dashboard
```
**Expected**: Dashboard loads (if logged in) OR redirects to login
**If stuck**: Issue with page loading or password check

### 4. Quick Fixes to Try

#### Fix 1: Clear Browser Data
1. Open DevTools → Application Tab
2. Clear Storage:
   - Cookies: Delete all `sb-*` cookies
   - LocalStorage: Clear all items
   - SessionStorage: Clear all items
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Try logging in again

#### Fix 2: Disable PasswordSetupGuard Temporarily
If the issue persists and you need immediate access:

```typescript
// In app/layout.tsx, temporarily comment out PasswordSetupGuard:

<AuthNav />
{/* <PasswordSetupGuard> */}
  {children}
{/* </PasswordSetupGuard> */}
```

#### Fix 3: Use Incognito/Private Window
- Opens fresh session without cached data
- Helps isolate if issue is browser-specific

#### Fix 4: Test Different Browser
- Try Chrome, Firefox, Safari, Edge
- Helps identify browser-specific issues

### 5. Environment Variable Check

Verify these are set correctly in Vercel:

```bash
# Required for authentication
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Base URL (should use correct domain)
NEXT_PUBLIC_BASE_URL=https://aiblueprint.k12aiblueprint.com

# Optional debug flags (disable in production)
NEXT_PUBLIC_AUTH_DEBUG=0
AUDIENCE_MIDDLEWARE_DEBUG=0
```

### 6. Vercel Deployment Check

Verify deployment status:

1. Go to Vercel Dashboard
2. Check latest deployment:
   - Status: Ready (not Building or Error)
   - Commit: 23ac3b3 or later
   - Domains: aiblueprint.k12aiblueprint.com configured
3. Check Function Logs for errors
4. Check Edge Middleware logs

### 7. Domain Configuration Check

Verify DNS and Vercel domain setup:

**DNS Records:**
```
Type: CNAME
Name: aiblueprint
Value: cname.vercel-dns.com
```

**Vercel Domains:**
- Primary: aiblueprint.k12aiblueprint.com
- Legacy (redirects): aiblueprint.higheredaiblueprint.com → aiblueprint.k12aiblueprint.com

### 8. Specific Error Resolution

#### "Fetch finished loading" then stuck
- **Issue**: Navigation completing but page not updating
- **Check**: React state not updating after fetch
- **Solution**: Verify router.push() is being called
- **Status**: Should be fixed with timeout changes

#### "checking authentication" forever
- **Issue**: PasswordSetupGuard timeout not working
- **Check**: Console for timeout messages
- **Solution**: Should auto-resolve after 5 seconds now
- **Status**: ✅ Fixed in commit cea3cf6

#### Redirect to login with "message=password-set"
- **Issue**: Password setup flow interfering
- **Check**: Do you have password setup tokens in database?
- **Solution**: Complete password setup or clear tokens
- **Query**: 
  ```sql
  SELECT * FROM auth_password_setup_tokens 
  WHERE user_id = '[your-user-id]' 
  AND used_at IS NULL;
  ```

## Report Template

If issue persists, provide this information:

```
**Browser**: [Chrome/Firefox/Safari/Edge]
**URL**: https://aiblueprint.k12aiblueprint.com/[specific-page]
**Issue**: [Describe what happens]

**Console Errors** (copy from DevTools Console):
[Paste error messages here]

**Network Requests** (failed requests from DevTools Network tab):
[Paste failed requests here]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Steps to Reproduce**:
1. 
2. 
3. 

**Screenshots**:
[Attach if helpful]
```

## Contact Support

If none of these steps resolve the issue:
1. Take screenshots of Console and Network tabs
2. Note exact error messages
3. Document the exact steps to reproduce
4. Check Vercel deployment logs for server-side errors

---

**Last Updated**: September 30, 2025, 2:45 PM PST  
**Latest Commit**: 23ac3b3 (baseUrl domain fix)  
**Previous Commit**: cea3cf6 (PasswordSetupGuard timeout fix)

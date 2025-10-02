# Chrome Authentication Debug Guide

## Test Pages Available

1. **Chrome Test Page**: `/test-chrome-signup`
   - Dedicated Chrome testing interface
   - Real-time logging
   - Separate signup and login tests

2. **Regular Login**: `/auth/login`
   - Production login page
   - Has Chrome workaround implemented

3. **Diagnostic Page**: `/auth/diagnose`
   - Network connectivity tests
   - Supabase health checks

## Chrome Issues to Check

### 1. Third-Party Cookie Blocking
Chrome aggressively blocks third-party cookies which can affect Supabase Auth.

**To check:**
- Open Chrome Settings → Privacy and Security → Cookies
- Check if "Block third-party cookies" is enabled
- Try adding exception for your domain

### 2. CORS Issues
**Signs:**
- "CORS policy" errors in console
- Preflight OPTIONS requests failing
- Headers missing in response

**To debug:**
```javascript
// Check in console
fetch('https://jocigzsthcpspxfdfxae.supabase.co/auth/v1/health', {
  headers: {
    'apikey': 'your-anon-key'
  }
}).then(r => console.log('Status:', r.status))
```

### 3. Network Timing
**To monitor:**
1. Open DevTools → Network tab
2. Look for requests to `supabase.co`
3. Check timing:
   - Stalled/Blocking time
   - DNS lookup
   - SSL handshake
   - Waiting (TTFB)

### 4. Extensions Interference
Some extensions can block auth requests.

**Test:**
1. Try in Incognito mode (with extensions disabled)
2. Or create new Chrome profile
3. Disable extensions one by one

## Step-by-Step Chrome Testing

### For Signup:
1. Navigate to `/test-chrome-signup`
2. Open DevTools (F12)
3. Go to Network tab
4. Clear all cookies: Application → Storage → Clear site data
5. Enter email: `chrome.test@example.com`
6. Enter password: `test123`
7. Click "Test Signup"
8. Watch logs and network requests

### For Login:
1. If signup says "already registered"
2. Click "Test Login" 
3. Watch for:
   - Request duration
   - Any pending/stalled requests
   - Response status codes

## Common Chrome-Specific Errors

### 1. ERR_CERT_COMMON_NAME_INVALID
- SSL certificate issue
- Try accessing in HTTP first
- Check if corporate firewall is interfering

### 2. net::ERR_CONNECTION_RESET
- Connection interrupted
- Could be firewall/proxy
- Try different network

### 3. Request Timeout (15s)
- Our code has 15s timeout
- Chrome might have additional timeouts
- Check if request even reaches server

## Workarounds Implemented

1. **Direct API calls** instead of Supabase SDK
2. **Timeout protection** (10s for Chrome)
3. **Detailed logging** for debugging
4. **Browser detection** with specific handling

## If Chrome Still Fails

1. **Use Alternative Browsers**:
   - Safari
   - Firefox
   - Edge (Chromium but different policies)

2. **Check Chrome Policies**:
   - Type `chrome://policy` in address bar
   - Look for auth/cookie related policies

3. **Try Chrome Flags**:
   - Type `chrome://flags`
   - Search for "SameSite"
   - Try "Disabled" for testing

## Data to Collect for Debugging

When Chrome auth fails, collect:

1. **Console errors** (full text)
2. **Network HAR file**:
   - Right-click in Network tab
   - "Save all as HAR with content"
3. **Chrome version**: `chrome://version`
4. **Enabled flags**: `chrome://flags`
5. **Policies**: `chrome://policy`

## Quick Test Commands

```bash
# Test Supabase endpoint directly
curl -H "apikey: YOUR_ANON_KEY" \
  https://jocigzsthcpspxfdfxae.supabase.co/auth/v1/health

# Test from Node.js
node test-chrome-auth.js

# Run local server
npm run dev
# Then visit http://localhost:3000/test-chrome-signup
```

## Contact Support With:

1. HAR file from failed request
2. Console errors
3. Chrome version
4. Steps to reproduce
5. Whether it works in other browsers
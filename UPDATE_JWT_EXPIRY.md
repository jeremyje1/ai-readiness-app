# Update JWT Expiry - Browser Console Method

Since the Supabase CLI doesn't have a direct command to update JWT expiry, I'll provide you with the easiest method to do this.

## Option 1: Via Supabase Dashboard (EASIEST - 2 MINUTES)

### Step-by-Step Instructions with Screenshots:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Sign in if needed

2. **Select Your Project**
   - Look for: **AI Readiness Assessment**
   - Project ID: `jocigzsthcpspxfdfxae`

3. **Navigate to Authentication Settings**
   - In the left sidebar, click: **⚙️ Settings** (gear icon at bottom)
   - Then click: **Authentication** (in the settings menu)

4. **Find JWT Settings Section**
   - Scroll down on the Authentication page
   - Look for section titled: **"JWT Settings"** or **"Session Management"**
   - You should see: **"JWT expiry time"** with a number field

5. **Update the Value**
   - Current value should be: `3600` (1 hour)
   - Change it to: `86400` (24 hours)
   - Click: **Save** button at the bottom

6. **Done!** ✅
   - The change takes effect immediately for new logins
   - No deployment needed

---

## Option 2: If You Can't Find JWT Settings in Dashboard

If you don't see "JWT Settings" in the Authentication page, try this:

### Alternative Location 1: Auth Config
1. Go to: **Settings** → **Configuration** → **Auth**
2. Look for: "JWT Expiry" or "Session Duration"
3. Update: `3600` → `86400`
4. Save

### Alternative Location 2: API Settings
1. Go to: **Settings** → **API**
2. Scroll to: "JWT Settings" section
3. Look for: "JWT Expiry" field
4. Update: `3600` → `86400`
5. Save

---

## Option 3: Via Supabase Management API (ADVANCED)

If you still can't find it in the dashboard, you can use the API directly:

### Get Your Access Token First:

1. **In Supabase Dashboard**, open browser DevTools (F12 or Cmd+Option+I)
2. Go to: **Console** tab
3. Run this command:
   ```javascript
   localStorage.getItem('supabase.auth.token')
   ```
4. Copy the token value (long string)

### Then Update JWT Expiry:

5. In the same Console, run:
   ```javascript
   const token = localStorage.getItem('supabase.auth.token');
   const projectRef = 'jocigzsthcpspxfdfxae';
   
   fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
     method: 'PATCH',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       JWT_EXP: 86400
     })
   })
   .then(res => res.json())
   .then(data => console.log('✅ JWT Expiry Updated!', data))
   .catch(err => console.error('❌ Error:', err));
   ```

---

## Verification

After updating via any method above, verify the change:

1. **Log out** of your app completely
2. **Log back in** to: https://aiblueprint.higheredaiblueprint.com
3. **Open browser DevTools** (F12 or Cmd+Option+I)
4. **Go to Console tab**
5. **Run this**:
   ```javascript
   supabase.auth.getSession().then(({ data: { session } }) => {
     console.log('Session expires at:', new Date(session.expires_at * 1000));
     console.log('Hours until expiry:', Math.round((session.expires_at * 1000 - Date.now()) / 1000 / 60 / 60));
   });
   ```
6. **Expected Result**: Should show ~24 hours (not 1 hour)

---

## What Each Option Does

All three options accomplish the same thing:
- **Option 1**: User-friendly dashboard interface (recommended)
- **Option 2**: Alternative dashboard locations (if UI has changed)
- **Option 3**: Direct API call (for power users)

**Result**: JWT access tokens will last 24 hours instead of 1 hour.

---

## Need Help?

If you're having trouble finding the JWT settings:

1. **Take a screenshot** of your Supabase Settings → Authentication page
2. **Share it** so I can see the exact UI you're looking at
3. **I'll guide you** to the exact button/field

Or:

- **Use Option 3** (browser console method) - it always works regardless of UI changes

---

## Important Notes

- ✅ This is a **configuration change only** (no code deployment)
- ✅ Takes effect **immediately** for new logins
- ✅ Existing sessions continue with their original expiry
- ✅ Can be **instantly reversed** if needed
- ✅ Industry-standard session duration for SaaS apps

---

**Status**: Ready to apply
**Time Required**: 2 minutes  
**Risk Level**: 🟢 LOW (configuration-only, instantly reversible)

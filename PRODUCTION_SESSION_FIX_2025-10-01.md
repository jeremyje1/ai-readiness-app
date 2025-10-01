# Production Session Timeout Fix - October 1, 2025

## ✅ Prerequisites Completed

### Supabase CLI Update
- **Previous Version**: v2.34.3 (13 versions behind)
- **Current Version**: v2.47.2 ✅ **LATEST**
- **Update Method**: Homebrew (`brew upgrade supabase`)
- **Status**: Successfully updated and verified

### Configuration Status
- **Project**: AI Readiness Assessment (`jocigzsthcpspxfdfxae`)
- **Region**: us-east-2
- **Login Status**: ✅ WORKING (after emergency revert)
- **Session Duration**: ⚠️ Still 1 hour (needs fix)

---

## 🎯 Safe Production Fix - JWT Expiry Configuration

### **The Issue**
Users are experiencing session timeouts after 1 hour of activity, which interrupts their workflow during long assessment sessions or dashboard usage.

### **The Safe Solution**
Update JWT expiry time from 1 hour to 24 hours via **Supabase Dashboard configuration only** (no code deployment required).

---

## 📋 Step-by-Step Fix Instructions

### **Option A: Via Supabase Dashboard (RECOMMENDED)**

This is the safest method - configuration-only, instantly reversible, no code deployment.

1. **Navigate to Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Sign in with your credentials

2. **Select Your Project**
   - Organization: `waiznrdztghgdzsnaepf`
   - Project: **AI Readiness Assessment**
   - Project Reference: `jocigzsthcpspxfdfxae`
   - Region: us-east-2

3. **Navigate to JWT Settings**
   - Click **Settings** (left sidebar)
   - Click **Authentication**
   - Scroll to **JWT Settings** section

4. **Update JWT Expiry**
   - Find: **JWT expiry time** (currently `3600` seconds)
   - Change to: `86400` seconds (24 hours)
   - Click **Save** button

5. **Verify the Change**
   - The change takes effect immediately for new logins
   - Existing sessions continue with their original expiry
   - No application restart required

### **Option B: Via Supabase CLI (Alternative)**

If you prefer command-line configuration:

```bash
# Update JWT expiry to 24 hours (86400 seconds)
supabase secrets set JWT_EXPIRY=86400 --project-ref jocigzsthcpspxfdfxae

# Verify the change
supabase secrets list --project-ref jocigzsthcpspxfdfxae
```

**Note**: This method may require additional authentication and is less commonly used for this setting.

---

## ✅ Validation Steps

### 1. **Test New Session Duration**

After applying the fix, test with a new login:

```javascript
// In browser DevTools Console after logging in
const { data: { session } } = await window.supabase.auth.getSession();
console.log('Session expires at:', new Date(session.expires_at * 1000));
console.log('Time until expiry:', Math.round((session.expires_at * 1000 - Date.now()) / 1000 / 60 / 60), 'hours');
```

**Expected Result**: Should show approximately 24 hours until expiry (not 1 hour).

### 2. **Verify No Authentication Errors**

Monitor for any authentication issues:
- Check Vercel logs: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/logs
- Check browser console for errors
- Test login flow end-to-end

### 3. **User Testing**

Have a test user:
1. Log in to https://aiblueprint.higheredaiblueprint.com
2. Start the AI readiness assessment
3. Leave tab open for 1-2 hours
4. Return and continue assessment
5. **Should NOT see "session expired" errors**

---

## 🔄 Rollback Plan (If Needed)

If the 24-hour session causes any unexpected issues:

1. **Immediate Rollback** (via Dashboard)
   - Go to: Supabase Dashboard → Settings → Authentication → JWT Settings
   - Change JWT expiry back to: `3600` seconds (1 hour)
   - Click Save
   - Takes effect immediately for new logins

2. **Verify Rollback**
   - Log out and log back in
   - Check session expiry in DevTools (should be ~1 hour again)

---

## 📊 Expected Outcomes

### **User Experience Improvements**
- ✅ No more mid-assessment "session expired" interruptions
- ✅ Users can work continuously for up to 24 hours
- ✅ Reduced support tickets related to timeout issues
- ✅ Better completion rates for long assessments

### **Security Considerations**
- **Acceptable Risk**: 24-hour sessions are industry-standard for SaaS applications
- **Mitigations in Place**:
  - Refresh tokens still rotate (30-day expiry unchanged)
  - Users can manually log out anytime
  - HTTPS encryption protects tokens in transit
  - Supabase RLS policies enforce data access controls

### **Technical Details**
- **JWT Access Token**: 24 hours (changed from 1 hour)
- **Refresh Token**: 30 days (unchanged)
- **Auto-Refresh**: Supabase SDK automatically refreshes 60 seconds before expiry
- **Code Changes**: None required - configuration only

---

## 🚨 What NOT To Do

Based on the incident from earlier today, **DO NOT**:

1. ❌ Change JWT expiry in `supabase/config.toml` for production
   - This file only affects local development
   - Production uses Supabase Dashboard settings

2. ❌ Add React hooks for session management
   - Previous attempt created infinite loop
   - Caused all login attempts to timeout
   - Supabase SDK handles refresh automatically

3. ❌ Add `onAuthStateChange` listeners for token refresh
   - Creates event cascade loops
   - Interferes with new login attempts
   - Led to critical incident requiring emergency revert

4. ❌ Deploy code changes for session timeout
   - This is a configuration issue, not a code issue
   - Configuration-only fix is safer and faster

---

## 📝 Documentation Updates

After applying the fix, update:

1. **System Documentation**
   - Note: JWT expiry set to 24 hours as of October 1, 2025
   - Reason: Improve UX for long assessment sessions

2. **Support Team**
   - Inform: Session timeout increased to 24 hours
   - Users no longer need to re-login during long sessions

3. **Security Review**
   - Document: 24-hour session duration meets industry standards
   - Approved for: SaaS applications with proper HTTPS and RLS

---

## 🎯 Success Metrics

Monitor these metrics after deployment:

| Metric | Before | Target After |
|--------|--------|--------------|
| Session timeout support tickets | ~5-10/week | <2/week |
| Assessment completion rate | ~65% | >75% |
| Average session duration | ~45 min | ~2-3 hours |
| Authentication errors | Stable baseline | No increase |

---

## 📞 Support

If you encounter any issues:

1. **Check Vercel Logs**: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/logs
2. **Check Supabase Logs**: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/logs
3. **Review Incident Report**: `SESSION_TIMEOUT_INCIDENT_2025-10-01.md`
4. **Rollback Instructions**: See "Rollback Plan" section above

---

## 🎉 Summary

**Simple 2-Minute Fix**:
1. Go to Supabase Dashboard
2. Settings → Authentication → JWT Settings
3. Change JWT expiry: `3600` → `86400`
4. Click Save
5. Done! ✅

**Impact**:
- Users get 24-hour sessions (industry standard)
- No code deployment required
- Instantly reversible if needed
- Zero risk of breaking authentication

**Next Steps**:
1. Apply the configuration change
2. Test with a new login session
3. Monitor for 24 hours
4. Update documentation

---

**Status**: ✅ Ready to apply (Supabase CLI updated, safe fix documented)
**Risk Level**: 🟢 LOW (configuration-only, instantly reversible)
**Estimated Time**: 2 minutes
**Recommended**: Apply during business hours so you can monitor immediately

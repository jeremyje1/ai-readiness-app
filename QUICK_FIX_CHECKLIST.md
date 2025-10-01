# 🚀 Quick Fix Checklist - Session Timeout Resolution

**Date**: October 1, 2025  
**Issue**: Users experience "session expired" after 1 hour  
**Solution**: Update Supabase JWT expiry to 24 hours  
**Method**: Configuration-only (no code deployment)

---

## ✅ Pre-Flight Checks (COMPLETED)

- [x] Supabase CLI updated from v2.34.3 → v2.47.2
- [x] Login functionality working (after emergency revert)
- [x] Documentation created and deployed
- [x] Production site live and stable

---

## 🎯 Apply the Fix (2 Minutes)

### Method 1: Supabase Dashboard (RECOMMENDED)

1. **Go to**: https://supabase.com/dashboard
2. **Select**: AI Readiness Assessment (`jocigzsthcpspxfdfxae`)
3. **Navigate**: Settings → Authentication → JWT Settings
4. **Change**: JWT expiry time from `3600` to `86400` seconds
5. **Click**: Save

✅ **Done!** Change takes effect immediately for new logins.

### Method 2: Supabase CLI (Alternative)

```bash
supabase secrets set JWT_EXPIRY=86400 --project-ref jocigzsthcpspxfdfxae
```

---

## 🧪 Test the Fix

### Quick Test (Browser DevTools)

After logging in, open browser console and run:

```javascript
const { data: { session } } = await window.supabase.auth.getSession();
console.log('Expires:', new Date(session.expires_at * 1000));
console.log('Hours until expiry:', Math.round((session.expires_at * 1000 - Date.now()) / 1000 / 60 / 60));
```

**Expected**: Should show ~24 hours (not 1 hour)

### User Test

1. Log in to https://aiblueprint.higheredaiblueprint.com
2. Start assessment
3. Leave tab open for 1-2 hours
4. Return and continue
5. **Should NOT see "session expired" error**

---

## 📊 Monitor

Check these for 24 hours after applying fix:

- [ ] Vercel logs: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/logs
- [ ] Supabase logs: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/logs
- [ ] User reports of session timeouts (should decrease significantly)
- [ ] Authentication errors (should remain stable)

---

## 🔄 Rollback (If Needed)

If any issues occur:

1. **Go to**: Supabase Dashboard → Settings → Authentication → JWT Settings
2. **Change**: JWT expiry back to `3600` seconds
3. **Click**: Save

Takes effect immediately for new logins.

---

## 📋 Success Criteria

- ✅ Users can work for 24 hours without "session expired" interruption
- ✅ No increase in authentication errors
- ✅ Assessment completion rates improve
- ✅ Support tickets about session timeouts decrease

---

## 📞 Support Resources

- **Incident Report**: `SESSION_TIMEOUT_INCIDENT_2025-10-01.md`
- **Full Guide**: `PRODUCTION_SESSION_FIX_2025-10-01.md`
- **Vercel Logs**: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/logs
- **Supabase Dashboard**: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae

---

## 🎉 Summary

**What Changed**:
- Supabase CLI: v2.34.3 → v2.47.2 ✅
- JWT Expiry: 1 hour → 24 hours (pending your action)

**Next Step**:
👉 **Apply the fix via Supabase Dashboard now** (2 minutes)

**Risk Level**: 🟢 LOW (configuration-only, instantly reversible)

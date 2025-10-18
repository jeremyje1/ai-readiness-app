# Post-Deployment Testing Guide - SendGrid Webhook Fix

## 🎯 Quick Test Checklist

After deployment completes, perform these tests to verify the fix is working:

### ✅ Test 1: Verify Bot Requests Are Rejected

**Watch Vercel Logs**: https://vercel.com/jeremys-projects-73929cad/ai-readiness/logs

**Look for:**
- ❌ **BEFORE FIX**: `📨 Received form submission: { name: 'undefined undefined', email: undefined, ... }`
- ✅ **AFTER FIX**: `⚠️ Rejected empty/invalid payload` (minimal logging)

**Expected**: Bot/scraper requests return 400 immediately without detailed logging.

---

### ✅ Test 2: Test Legitimate Form Submission

**If you have access to the WordPress lead generation page:**

1. Fill out form completely:
   ```
   First Name: Test
   Last Name: User
   Email: your-email@example.com
   Institution: Test University
   Role: Chief Information Officer
   Institution Type: Four-Year Public
   Interest: AI Readiness Assessment
   Message: Testing SendGrid webhook after spam fix
   Timeline: 1-3 months
   ```

2. Submit form

3. **Expected Results:**
   - ✅ Form shows success message
   - ✅ Email received at info@northpathstrategies.org with all form data
   - ✅ Confirmation email sent to your test email
   - ✅ Vercel logs show: `📨 Received form submission: { name: 'Test User', email: 'your-email@example.com', ... }`
   - ✅ No 400 errors

---

### ✅ Test 3: Monitor Production Logs for 1 Hour

**After deployment, watch logs for patterns:**

```bash
# In Vercel dashboard, filter for: /api/webhooks/sendgrid

# Good signs:
✅ Fewer total requests (bot traffic filtered)
✅ No "undefined undefined" errors
✅ Only legitimate submissions logged with real data

# Bad signs (investigate):
❌ Legitimate forms returning 400
❌ Emails not being sent
❌ Still seeing "undefined undefined" spam
```

---

## 🚨 Rollback Plan (If Needed)

If legitimate forms start failing:

```bash
# 1. Revert to previous commit
git revert 847e1c9
git push origin main

# 2. Or redeploy previous version in Vercel dashboard

# 3. Investigate logs to identify why real submissions failed
```

---

## 📊 Success Criteria

**Fix is successful if after 24 hours:**

- ✅ **Zero** `undefined undefined` errors in logs
- ✅ **100%** of legitimate form submissions send emails
- ✅ **>95% reduction** in 400 error rate for `/api/webhooks/sendgrid`
- ✅ **No user complaints** about forms not working

---

## 🔍 Debugging Common Issues

### Issue: Legitimate forms return 400

**Possible cause**: New validation too strict

**Check logs for**:
```
❌ Invalid JSON payload received
⚠️ Rejected empty/invalid payload
```

**Solution**: Review actual payload being sent, may need to adjust validation logic

---

### Issue: Emails not being sent

**Possible cause**: SendGrid API key issue

**Check logs for**:
```
❌ SendGrid API Error: 401
SENDGRID_API_KEY is not configured
```

**Solution**: 
1. Verify `SENDGRID_API_KEY` environment variable in Vercel
2. Test with: `curl -X POST https://aiblueprint.educationaiblueprint.com/api/webhooks/sendgrid ...`

---

### Issue: Still seeing spam/bot requests

**Possible cause**: Bots sending valid JSON objects

**Next steps**:
1. Analyze bot patterns in logs
2. Consider adding rate limiting
3. Consider adding honeypot field
4. Consider adding IP-based blocking

See "Security Considerations" in `SENDGRID_WEBHOOK_SPAM_FIX_OCT18.md` for implementation details.

---

## 📞 Contact

If issues arise during testing, check:
- Vercel deployment logs
- `SENDGRID_WEBHOOK_SPAM_FIX_OCT18.md` for detailed documentation
- GitHub commit history: `git log --oneline -10`

---

**Last Updated**: October 18, 2025  
**Commit**: `847e1c9`  
**Status**: 🚀 Deployed to production

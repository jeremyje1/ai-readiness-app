# 🧪 Quick Testing Guide - Education AI Blueprint Demo

**Status**: ✅ Deployed to Production  
**Date**: October 17, 2025  
**Production URL**: https://aiblueprint.educationaiblueprint.com

---

## 🚀 Ready to Test!

The Education AI Blueprint Demo Tool is now **LIVE** on production. Follow these steps to verify everything works:

---

## Step 1: Test the Demo Page (5 minutes)

### **Open Demo Page**
```
https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html
```

### **Complete the Assessment**

1. **Landing Page** - Click "Start Assessment" button
   - ✅ Page loads without errors
   - ✅ Button is visible and clickable

2. **Lead Form** - Fill in your information:
   ```
   First Name: [Your Name]
   Last Name: [Your Last Name]
   Email: [Your Email]
   Institution: Test University
   Institution Type: Four-Year College/University
   Role: CIO/CTO/Technology Director
   ```
   - ✅ All fields accept input
   - ✅ "Continue to Assessment" button works

3. **Assessment Questions** - Answer all 12 questions
   - Use emoji scale (🔴 to 🔵) for each question
   - Progress bar shows completion (0% → 100%)
   - ✅ All questions answerable
   - ✅ "Next" button navigates correctly
   - ✅ Can go back to previous questions

4. **Results Page** - View your results
   - ✅ Overall score displays (e.g., "67%")
   - ✅ Readiness level shows (e.g., "Progressing")
   - ✅ 7 category bars render correctly
   - ✅ 3 Quick Wins display with priority badges
   - ✅ CTAs visible (Schedule Meeting + Email)

---

## Step 2: Verify Database Record (2 minutes)

### **Query Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae
2. Click **SQL Editor** → **New Query**
3. Run this query:

```sql
SELECT 
  id,
  first_name,
  last_name,
  email,
  institution_name,
  overall_score,
  lead_qualification,
  user_email_sent,
  sales_email_sent,
  created_at
FROM demo_leads
ORDER BY created_at DESC
LIMIT 1;
```

### **Expected Result**
```
✅ 1 row returned
✅ email matches your test email
✅ overall_score is a number (0-100)
✅ lead_qualification is "HOT", "WARM", or "COLD"
✅ created_at is recent (within last 5 minutes)
```

---

## Step 3: Check Emails (3 minutes)

### **User Results Email**
**Check your inbox** (the email you used in Step 1)

**Subject**: `Your AI Readiness Results: [score]% ([level])`

**Expected Content**:
- ✅ Personalized greeting with your name
- ✅ Score circle with percentage
- ✅ 7 category progress bars
- ✅ Impact section (time/cost/efficiency)
- ✅ Top 3 Quick Wins with icons
- ✅ 2 CTAs (Schedule Consultation + Email Reply)

### **Sales Notification Email**
**Check**: info@northpathstrategies.org

**Subject**: `New Demo Lead: [Your Name] from Test University ([qualification])`

**Expected Content**:
- ✅ Lead qualification badge (🔥 HOT / ⚡ WARM / ❄️ COLD)
- ✅ Contact information table
- ✅ Assessment results with 7 categories
- ✅ 3 AI-generated talking points
- ✅ Top 3 Quick Wins
- ✅ 3 action buttons (Email, View Profile, Schedule)

**⚠️ If emails don't arrive within 2 minutes:**
1. Check spam/junk folders
2. Verify email sent flag in database:
   ```sql
   SELECT user_email_sent, sales_email_sent 
   FROM demo_leads 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
3. Check Vercel logs for errors:
   ```bash
   vercel logs --follow | grep "/api/demo/emails"
   ```

---

## Step 4: Monitor Logs (Optional, 2 minutes)

### **Vercel Logs**
```bash
cd /Users/jeremy.estrella/Desktop/ai-readiness-app-main
vercel logs --follow
```

### **Filter for Demo Routes**
```bash
vercel logs --follow | grep "/api/demo"
```

### **Look For**
- ✅ **200/201 responses** = Success
- ❌ **500 errors** = Server issue (check database connection)
- ❌ **401/403 errors** = Authentication issue (check env vars)
- ❌ **405 errors** = Wrong HTTP method

---

## 🐛 Common Issues & Quick Fixes

### **Issue: Demo page won't load**
**Solution**: Clear browser cache or try incognito mode
```
Chrome: Cmd+Shift+Delete → Clear cache
Safari: Cmd+Option+E → Empty caches
```

### **Issue: Form submission fails**
**Check**:
1. Browser console for errors (F12 → Console tab)
2. Network tab shows POST request status
3. CORS errors → Verify API routes have CORS headers

**Quick Fix**: Add CORS headers manually in route files if needed

### **Issue: No emails received**
**Check**:
1. Database `user_email_sent` and `sales_email_sent` flags
2. SendGrid API key in Vercel env vars: 
   ```bash
   vercel env ls | grep SENDGRID
   ```
3. Vercel logs for email endpoint errors

**Quick Fix**: Manually trigger email by calling API directly:
```bash
curl -X POST https://aiblueprint.educationaiblueprint.com/api/demo/emails/user-results \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "[UUID from database]",
    "email": "your-email@example.com",
    "firstName": "Test",
    "score": 67,
    "readinessLevel": "Progressing"
  }'
```

### **Issue: Database record missing**
**Check**:
1. Supabase RLS policies allow inserts
2. Service role key set in Vercel env vars
3. Database connection URL correct

**Quick Fix**: Verify RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'demo_leads';
```

---

## ✅ Success Criteria

### **Minimum Viable Test** (Must Pass)
- ✅ Demo page loads without errors
- ✅ Can complete all 12 questions
- ✅ Results page displays with score
- ✅ Database record created
- ✅ At least 1 email received (user OR sales)

### **Full Success** (Ideal)
- ✅ All minimum criteria passed
- ✅ Both emails received (user AND sales)
- ✅ Email formatting perfect (no broken HTML)
- ✅ No console errors on any page
- ✅ Mobile-responsive (test on phone)

---

## 📊 Test Results Template

**Date Tested**: _____________  
**Tested By**: _____________

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| Demo page loads | ⬜ | |
| Lead form submits | ⬜ | |
| All 12 questions work | ⬜ | |
| Results page displays | ⬜ | |
| Database record created | ⬜ | |
| User email received | ⬜ | |
| Sales email received | ⬜ | |
| Mobile responsive | ⬜ | |

**Overall Status**: ⬜ PASS / ⬜ FAIL

**Issues Found**:
- 
- 
- 

**Next Steps**:
- 
- 

---

## 🚀 After Testing

### **If All Tests Pass** ✅
1. Mark deployment as verified in DEPLOYMENT_SUCCESS_OCT17.md
2. Proceed to WordPress embedding
3. Announce on LinkedIn/email newsletter
4. Monitor first 24 hours for any issues

### **If Tests Fail** ❌
1. Document exact error messages
2. Check Vercel deployment logs
3. Verify environment variables
4. Review database connection
5. Rollback if necessary (previous deployment ID: [previous])

---

## 📞 Support Resources

**Vercel Dashboard**: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app  
**Supabase Dashboard**: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae  
**Deployment Logs**: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/logs  
**Migration Docs**: `MIGRATION_SUCCESS.md`  
**Environment Vars**: `ENV_VERIFICATION_CHECKLIST.md`

---

## 🎯 Next Steps After Testing

1. **WordPress Embedding** - Embed demo on educationaiblueprint.com
2. **Mobile Testing** - Test on iPhone/Android browsers
3. **Marketing Launch** - LinkedIn post + email newsletter
4. **Analytics Setup** - Add Google Analytics tracking
5. **Lead Follow-Up** - Create nurture email sequence

---

**Happy Testing! 🎉**

If everything works as expected, you're ready to start generating qualified leads for Education AI Blueprint!

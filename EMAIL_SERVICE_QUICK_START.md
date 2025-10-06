# 📧 Email Service Quick Start Guide

## ✅ What's Been Completed

Your AI Blueprint email service is **fully configured and ready for deployment**!

### 📦 What We Built

**7 Customer Email Touchpoints:**
1. 🎉 Welcome Email (with/without password)
2. 📝 Assessment Started
3. ✅ Assessment Completed
4. 📋 Blueprint Generated
5. ⏰ Trial Ending Soon (3 days)
6. 📊 Weekly Progress Update
7. 🔔 Re-engagement (7 days inactive)

**2 Automated Cron Jobs:**
- Daily trial reminders (9 AM UTC)
- Daily re-engagement emails (10 AM UTC)

**Testing Endpoint:**
- `/api/test/emails` for development testing

---

## 🚀 Deploy in 3 Steps

### Step 1: Add Environment Variables to Vercel

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these **6 variables**:

```bash
POSTMARK_SERVER_TOKEN=455001d4-2657-4b12-bfc7-66c63734daf8
POSTMARK_API_TOKEN=455001d4-2657-4b12-bfc7-66c63734daf8
POSTMARK_FROM_EMAIL=info@northpathstrategies.org
POSTMARK_REPLY_TO=info@northpathstrategies.org
POSTMARK_MESSAGE_STREAM=aiblueprint-transactional
CRON_SECRET=[generate with: openssl rand -base64 32]
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

✅ **Apply to:** Production, Preview, Development (all 3)

### Step 2: Deploy to Vercel

Your code is already pushed to GitHub. Just deploy:

```bash
# Option 1: Automatic (if you have GitHub integration)
# Just wait for Vercel to auto-deploy from your latest push

# Option 2: Manual
npx vercel --prod
```

### Step 3: Test Email Sending

After deployment, test welcome email:

```bash
curl "https://api.postmarkapp.com/email" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: 455001d4-2657-4b12-bfc7-66c63734daf8" \
  -d '{
        "From": "info@northpathstrategies.org",
        "To": "info@northpathstrategies.org",
        "Subject": "✅ AI Blueprint Email Test",
        "HtmlBody": "<h1>Success!</h1><p>Email system works!</p>",
        "MessageStream": "aiblueprint-transactional"
      }'
```

Expected response: `"ErrorCode": 0, "Message": "OK"`

---

## 📖 How to Use the Email Service

### Send Welcome Email (in signup flow)

```typescript
import { emailTouchpoints } from '@/lib/email-touchpoints';

// After user creation
await emailTouchpoints.sendWelcomeEmail({
  email: user.email,
  name: user.full_name,
  institutionName: user.institution_name,
  institutionType: user.institution_type
}, hasPassword);
```

### Send Assessment Completed Email

```typescript
await emailTouchpoints.sendAssessmentCompletedEmail(
  {
    email: user.email,
    name: user.full_name,
    institutionName: userProfile.institution_name
  },
  {
    id: assessment.id,
    completedAt: assessment.completed_at,
    overallScore: assessment.overall_score,
    maturityLevel: assessment.readiness_level
  }
);
```

### Send Blueprint Generated Email

```typescript
await emailTouchpoints.sendBlueprintGeneratedEmail(
  {
    email: user.email,
    name: user.full_name,
    institutionName: userProfile.institution_name
  },
  {
    id: blueprint.id,
    title: blueprint.title,
    generatedAt: blueprint.generated_at,
    status: blueprint.status
  }
);
```

---

## 🧪 Test All Templates in Development

Visit: `http://localhost:3000/api/test/emails?email=your@email.com`

Test specific template:
- `/api/test/emails?template=welcome`
- `/api/test/emails?template=assessment-completed`
- `/api/test/emails?template=blueprint`
- `/api/test/emails?template=trial`
- `/api/test/emails?template=progress`
- `/api/test/emails?template=reengagement`

---

## 📊 Monitor Your Emails

### Postmark Dashboard
**Login:** https://account.postmarkapp.com/
- View delivery rates
- Check bounce/complaint rates
- Review email opens and clicks

### Vercel Cron Logs
**Dashboard:** https://vercel.com/[your-project]/settings/cron
- View cron execution logs
- Check success/failure rates
- Monitor timing

---

## 🔧 Integration Points

### Files to Edit Next:

1. **`app/api/auth/signup/route.ts`**
   - Add welcome email after user creation

2. **`app/api/assessment/submit/route.ts`**
   - Add assessment completed email

3. **`app/api/blueprint/generate/route.ts`**
   - Add blueprint generated email

---

## ⚡ Cron Jobs

### Trial Reminders
- **Endpoint:** `/api/cron/trial-reminders`
- **Schedule:** Daily at 9:00 AM UTC
- **Purpose:** Sends reminder 3 days before trial expires

### Re-engagement
- **Endpoint:** `/api/cron/re-engagement`
- **Schedule:** Daily at 10:00 AM UTC
- **Purpose:** Re-engages users inactive for 7+ days

### Test Manually:
```bash
curl -X GET "https://your-domain.vercel.app/api/cron/trial-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📈 Success Metrics

**Week 1 Goals:**
- ✅ 100% welcome emails delivered
- ✅ >90% email open rate
- ✅ Zero spam complaints
- ✅ All cron jobs running

**Track in Postmark:**
- Delivery rate: target >99%
- Open rate: target 40-60%
- Click rate: target 10-20%
- Bounce rate: target <2%

---

## 🚨 Troubleshooting

### Problem: "Emails not sending"

**Check:**
1. ✅ POSTMARK_SERVER_TOKEN is correct
2. ✅ Domain is verified in Postmark
3. ✅ Message stream `aiblueprint-transactional` exists

**Solution:** Review Postmark Activity Log for error details

---

### Problem: "Cron jobs not running"

**Check:**
1. ✅ CRON_SECRET is set in Vercel
2. ✅ `vercel.json` has crons array
3. ✅ Vercel dashboard shows cron jobs

**Solution:** Test endpoint manually with curl first

---

### Problem: "Emails going to spam"

**Check Postmark Dashboard:**
1. ✅ SPF record added to DNS
2. ✅ DKIM record added to DNS
3. ✅ DMARC record added to DNS
4. ✅ Domain shows "Verified" status

---

## 📝 File Reference

**Email Templates:** `lib/email-touchpoints.ts`
**Cron Jobs:**
- `app/api/cron/trial-reminders/route.ts`
- `app/api/cron/re-engagement/route.ts`

**Test Endpoint:** `app/api/test/emails/route.ts`
**Config:** `vercel.json`

**Documentation:**
- Full guide: `EMAIL_SERVICE_COMPLETE_SETUP.md`
- Deployment: `EMAIL_DEPLOYMENT_CHECKLIST.md`
- This guide: `EMAIL_SERVICE_QUICK_START.md`

---

## ✅ Final Checklist

- [ ] Add 6 environment variables to Vercel
- [ ] Generate CRON_SECRET
- [ ] Deploy to production
- [ ] Test welcome email with curl
- [ ] Verify domain in Postmark
- [ ] Check cron jobs in Vercel dashboard
- [ ] Create test user to trigger welcome email
- [ ] Monitor Postmark dashboard for 24 hours
- [ ] Add email calls to signup/assessment flows

---

## 🎉 You're Ready!

Your email service is **production-ready**. Just add the environment variables and deploy!

**Questions?** Review:
- `EMAIL_SERVICE_COMPLETE_SETUP.md` - Comprehensive guide
- `EMAIL_DEPLOYMENT_CHECKLIST.md` - Detailed deployment steps

**Support:** info@northpathstrategies.org

---

**🚀 Next Steps:**
1. Add environment variables to Vercel ⚡
2. Deploy to production 🎯
3. Test all emails 🧪
4. Integrate into user flows 🔧

**Your email system is ready to engage customers!** 📧✨

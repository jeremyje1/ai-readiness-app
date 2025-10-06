# Email Service Deployment Checklist
## Final Steps to Activate Email System

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Setup

Add these to **Vercel Environment Variables**:

```bash
# Postmark Configuration
POSTMARK_SERVER_TOKEN=455001d4-2657-4b12-bfc7-66c63734daf8
POSTMARK_API_TOKEN=455001d4-2657-4b12-bfc7-66c63734daf8
POSTMARK_FROM_EMAIL=info@northpathstrategies.org
POSTMARK_REPLY_TO=info@northpathstrategies.org
POSTMARK_MESSAGE_STREAM=aiblueprint-transactional

# Cron Job Security
CRON_SECRET=<generate-secure-random-string>

# Admin Notifications  
ADMIN_NOTIFICATION_EMAIL=info@northpathstrategies.org
ADMIN_EMAIL=info@northpathstrategies.org
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Postmark Domain Verification

✅ **Verify these steps in Postmark:**
- [ ] Domain `northpathstrategies.org` added to Sender Signatures
- [ ] DNS records (SPF, DKIM, DMARC) configured
- [ ] Domain status shows "Verified" ✅
- [ ] Message Stream `aiblueprint-transactional` created
- [ ] Test email sent successfully

### 3. Test Email Sending

```bash
# Test from command line
curl "https://api.postmarkapp.com/email" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-Postmark-Server-Token: 455001d4-2657-4b12-bfc7-66c63734daf8" \
  -d '{
        "From": "info@northpathstrategies.org",
        "To": "info@northpathstrategies.org",
        "Subject": "✅ AI Blueprint Email System Test",
        "HtmlBody": "<h1>Success!</h1><p>Email system is configured correctly.</p>",
        "MessageStream": "aiblueprint-transactional"
      }'
```

Expected: ✅ `"ErrorCode": 0, "Message": "OK"`

---

## 📦 Deployment Steps

### Step 1: Commit Changes

```bash
cd /Users/jeremy.estrella/Desktop/ai-readiness-app-main

# Add new files
git add lib/email-touchpoints.ts
git add app/api/cron/trial-reminders/route.ts
git add app/api/cron/re-engagement/route.ts
git add vercel.json
git add EMAIL_SERVICE_COMPLETE_SETUP.md
git add EMAIL_DEPLOYMENT_CHECKLIST.md

# Commit
git commit -m "feat: Complete email service with 7 touchpoints and automated cron jobs"

# Push
git push origin main
```

### Step 2: Deploy to Vercel

```bash
npx vercel --prod
```

### Step 3: Configure Cron Jobs in Vercel

1. Go to **Vercel Dashboard**
2. Select your project
3. Navigate to **Settings** → **Cron Jobs**
4. Verify these cron jobs are active:
   - ✅ `/api/cron/trial-reminders` - Daily at 9:00 AM UTC
   - ✅ `/api/cron/re-engagement` - Daily at 10:00 AM UTC

### Step 4: Set Cron Authentication

In **Vercel** → **Settings** → **Environment Variables**:

Add:
```
CRON_SECRET=<your-generated-secret>
```

Make sure to add it to **all environments** (Production, Preview, Development)

---

## 🧪 Testing in Production

### Test Welcome Email

Create a test user through signup:
```bash
# Should automatically receive welcome email
```

### Test Cron Jobs Manually

```bash
# Test trial reminders (requires CRON_SECRET)
curl -X GET "https://your-domain.vercel.app/api/cron/trial-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test re-engagement
curl -X GET "https://your-domain.vercel.app/api/cron/re-engagement" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "sent": 0,
  "failed": 0,
  "total": 0,
  "message": "...",
  "timestamp": "2025-10-06T..."
}
```

### Test All Email Templates

Create test endpoint: `app/api/test/emails/route.ts`

```typescript
import { emailTouchpoints } from '@/lib/email-touchpoints';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'test@example.com';
  
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const results = {
    welcome: await emailTouchpoints.sendWelcomeEmail({
      email,
      name: 'Test User',
      institutionName: 'Test University'
    }, false),
    
    assessmentStarted: await emailTouchpoints.sendAssessmentStartedEmail({
      email,
      name: 'Test User',
      institutionName: 'Test University'
    }),
    
    assessmentCompleted: await emailTouchpoints.sendAssessmentCompletedEmail(
      { email, name: 'Test User', institutionName: 'Test University' },
      { id: 'test', completedAt: new Date().toISOString(), overallScore: 75, maturityLevel: 'Developing' }
    ),
    
    blueprintGenerated: await emailTouchpoints.sendBlueprintGeneratedEmail(
      { email, name: 'Test User', institutionName: 'Test University' },
      { id: 'test', title: 'Test Blueprint', generatedAt: new Date().toISOString(), status: 'complete' }
    ),
    
    trialEnding: await emailTouchpoints.sendTrialEndingSoonEmail(
      { email, name: 'Test User', institutionName: 'Test University' },
      3
    ),
    
    reEngagement: await emailTouchpoints.sendReEngagementEmail(
      { email, name: 'Test User', institutionName: 'Test University' },
      7
    )
  };

  return NextResponse.json(results);
}
```

---

## 📊 Monitoring & Analytics

### Daily Monitoring Tasks

**Check Postmark Dashboard:**
- [ ] Delivery rate > 99%
- [ ] Bounce rate < 2%
- [ ] Complaint rate < 0.1%
- [ ] No unusual spikes in failures

**Check Vercel Logs:**
- [ ] Cron jobs running successfully
- [ ] No errors in email sends
- [ ] Response times normal

### Weekly Review

- [ ] Review email open rates (target: 40-60%)
- [ ] Review click-through rates (target: 10-20%)
- [ ] Check for any patterns in bounces/complaints
- [ ] Review user feedback about emails

---

## 🔧 Integration Points

### Add to Existing Routes

#### 1. Signup Flow (`app/api/auth/signup/route.ts`)

```typescript
import { emailTouchpoints } from '@/lib/email-touchpoints';

// After user creation
try {
  await emailTouchpoints.sendWelcomeEmail({
    email: user.email,
    name: user.full_name,
    institutionName: user.institution_name,
    institutionType: user.institution_type
  }, hasPassword);
} catch (error) {
  console.error('Failed to send welcome email:', error);
  // Don't fail signup if email fails
}
```

#### 2. Assessment Completion (`app/api/assessment/submit/route.ts`)

```typescript
import { emailTouchpoints } from '@/lib/email-touchpoints';

// After assessment saved
try {
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
} catch (error) {
  console.error('Failed to send assessment completion email:', error);
}
```

#### 3. Blueprint Generation (`app/api/blueprint/generate/route.ts`)

```typescript
import { emailTouchpoints } from '@/lib/email-touchpoints';

// After blueprint generation completes
try {
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('full_name, institution_name, institution_type')
    .eq('user_id', user.id)
    .single();

  await emailTouchpoints.sendBlueprintGeneratedEmail(
    {
      email: user.email,
      name: userProfile?.full_name || 'User',
      institutionName: userProfile?.institution_name
    },
    {
      id: blueprint.id,
      title: blueprint.title,
      generatedAt: blueprint.generated_at,
      status: blueprint.status
    }
  );
} catch (error) {
  console.error('Failed to send blueprint email:', error);
}
```

---

## 🚨 Troubleshooting

### Problem: Emails not sending

**Solutions:**
1. Check Postmark server token is correct
2. Verify domain is verified in Postmark
3. Check message stream exists
4. Review Postmark activity logs

### Problem: Emails going to spam

**Solutions:**
1. Verify SPF/DKIM/DMARC records
2. Use verified sender domain
3. Maintain low bounce rate
4. Warm up domain if brand new

### Problem: Cron jobs not running

**Solutions:**
1. Verify `vercel.json` cron configuration
2. Check CRON_SECRET is set correctly
3. Review Vercel cron logs
4. Test endpoints manually first

---

## 📈 Success Metrics

### Week 1 Goals
- [ ] 100% welcome emails delivered
- [ ] >90% email open rate
- [ ] Zero spam complaints
- [ ] All cron jobs running successfully

### Month 1 Goals
- [ ] >50% average open rate across all emails
- [ ] >15% click-through rate
- [ ] <1% bounce rate
- [ ] Positive user feedback on emails

---

## ✅ Final Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Postmark domain verified
- [ ] Test emails sent successfully
- [ ] Code committed and pushed

### Deployment
- [ ] Deployed to Vercel production
- [ ] Cron jobs configured in Vercel
- [ ] CRON_SECRET set in all environments
- [ ] Manual cron test successful

### Post-Deployment
- [ ] Signup welcome email tested
- [ ] Assessment email tested
- [ ] Blueprint email tested
- [ ] Cron jobs monitored for 7 days
- [ ] Analytics reviewed

### Documentation
- [ ] Team trained on email system
- [ ] Monitoring procedures documented
- [ ] Troubleshooting guide shared
- [ ] Success metrics tracked

---

## 🎉 Status

Current: **CONFIGURED - READY FOR DEPLOYMENT**

**Files Created:**
- ✅ `lib/email-touchpoints.ts` - 7 email templates
- ✅ `app/api/cron/trial-reminders/route.ts` - Automated trial reminders
- ✅ `app/api/cron/re-engagement/route.ts` - Re-engagement emails
- ✅ `EMAIL_SERVICE_COMPLETE_SETUP.md` - Comprehensive setup guide
- ✅ `EMAIL_DEPLOYMENT_CHECKLIST.md` - This checklist
- ✅ `vercel.json` - Cron job configuration

**Next Actions:**
1. Add environment variables to Vercel
2. Deploy to production
3. Test all email touchpoints
4. Monitor for 24 hours

---

**Questions?** Contact: info@northpathstrategies.org

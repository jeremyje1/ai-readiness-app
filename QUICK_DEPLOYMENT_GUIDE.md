# 🚀 Quick Deployment Guide - Education AI Blueprint Demo

**Status**: ✅ All code committed and tests passing  
**Branch**: `chore/upgrade-vitest-vite`  
**Commit**: `6e5f140`

---

## ⚡ 3-Step Quick Start

### Step 1: Apply Database Migration (5 minutes)

**Go to Supabase Dashboard**:
```
https://supabase.com/dashboard/project/YOUR_PROJECT/sql
```

**Copy & Run Migration**:
```bash
# Open this file:
supabase/migrations/20251017_create_demo_leads_table.sql

# Copy entire contents
# Paste into SQL Editor
# Click "Run"
```

**Verify**:
```sql
-- Should return table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'demo_leads';

-- Should return empty result set
SELECT * FROM demo_leads LIMIT 1;
```

---

### Step 2: Deploy to Production (3 minutes)

```bash
cd /Users/jeremy.estrella/Desktop/ai-readiness-app-main

# Push to GitHub (if not already)
git push origin chore/upgrade-vitest-vite

# Deploy to Vercel
vercel --prod
```

**Expected Output**:
```
✔ Production: https://ai-readiness-1y3qb2nth-jeremys-projects-73929cad.vercel.app [3s]
```

---

### Step 3: Test Demo Flow (5 minutes)

**1. Visit Demo Page**:
```
https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html
```

**2. Complete Assessment**:
- Fill out lead form (use real email to test emails)
- Answer all 12 questions
- View results page

**3. Verify Emails**:
- Check user inbox for results email
- Check `info@northpathstrategies.org` for sales notification

**4. Verify Database**:
```sql
SELECT 
  email,
  institution_name,
  overall_score,
  readiness_level,
  lead_qualification,
  completed_at
FROM demo_leads
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🎯 WordPress Embedding (10 minutes)

### Option A: Full-Page Embed (Recommended)

**1. Create New Page**:
- Login to WordPress admin
- Pages → Add New
- Title: "AI Readiness Assessment"
- Slug: `/ai-readiness-demo`

**2. Add Custom HTML Block**:
```html
<style>
  .demo-iframe-container {
    width: 100%;
    max-width: 100%;
    margin: 2rem auto;
  }
  .demo-iframe {
    width: 100%;
    height: 1400px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  @media (max-width: 768px) {
    .demo-iframe {
      height: 1800px;
    }
  }
</style>
<div class="demo-iframe-container">
  <iframe 
    src="https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html"
    class="demo-iframe"
    title="AI Readiness Assessment"
    loading="lazy"
    allow="clipboard-write; web-share">
  </iframe>
</div>
```

**3. Publish**

**4. Test**:
- Visit: `https://educationaiblueprint.com/ai-readiness-demo`
- Test on mobile (iPhone/Android)
- Verify form submission works
- Check console for errors (F12)

### Option B: Landing Page with CTA

**Add to existing page**:
```html
<div style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 3rem; border-radius: 16px; text-align: center; color: white; margin: 2rem 0;">
  <h2 style="font-size: 2rem; margin-bottom: 1rem;">
    Discover Your Institution's AI Readiness
  </h2>
  <p style="font-size: 1.125rem; margin-bottom: 2rem; opacity: 0.95;">
    Get personalized recommendations and actionable quick wins in under 10 minutes
  </p>
  <div style="display: flex; gap: 1rem; justify-content: center; align-items: center; flex-wrap: wrap;">
    <div style="text-align: center;">
      <div style="font-size: 2.5rem; font-weight: 800;">10</div>
      <div style="font-size: 0.875rem;">Minutes</div>
    </div>
    <div style="text-align: center;">
      <div style="font-size: 2.5rem; font-weight: 800;">12</div>
      <div style="font-size: 0.875rem;">Questions</div>
    </div>
    <div style="text-align: center;">
      <div style="font-size: 2.5rem; font-weight: 800;">100+</div>
      <div style="font-size: 0.875rem;">Institutions</div>
    </div>
  </div>
  <a href="/ai-readiness-demo" style="display: inline-block; background: white; color: #1e40af; padding: 1rem 2.5rem; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 2rem; font-size: 1.125rem;">
    Start Free Assessment →
  </a>
  <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.9;">
    ✓ No credit card required ✓ Instant results ✓ FERPA-compliant
  </p>
</div>
```

---

## 📊 Monitoring & Analytics

### Add Google Analytics Events (Optional)

**In WordPress page**:
```html
<script>
  // Track demo starts
  window.addEventListener('message', function(event) {
    if (event.data.type === 'demo_started') {
      gtag('event', 'demo_started', {
        'event_category': 'engagement',
        'event_label': 'AI Readiness Demo'
      });
    }
    if (event.data.type === 'demo_completed') {
      gtag('event', 'demo_completed', {
        'event_category': 'conversion',
        'event_label': 'AI Readiness Demo',
        'value': event.data.score
      });
    }
  });
</script>
```

### Check Supabase Dashboard

**Daily Report Query**:
```sql
-- Run this daily to track performance
SELECT 
  DATE(completed_at) as date,
  COUNT(*) as completions,
  ROUND(AVG(overall_score), 1) as avg_score,
  COUNT(*) FILTER (WHERE lead_qualification = 'HOT') as hot_leads,
  COUNT(*) FILTER (WHERE lead_qualification = 'WARM') as warm_leads,
  COUNT(*) FILTER (WHERE lead_qualification = 'COLD') as cold_leads,
  COUNT(*) FILTER (WHERE demo_scheduled = true) as demos_scheduled
FROM demo_leads
WHERE completed_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(completed_at)
ORDER BY date DESC;
```

---

## 🔧 Troubleshooting

### Issue: Demo page is blank

**Solution**:
1. Check browser console (F12)
2. Look for CORS errors
3. Verify Vercel deployment succeeded
4. Test direct URL: `https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html`

### Issue: Form submission fails

**Solution**:
1. Check Network tab (F12)
2. Look for 500 errors on `/api/demo/leads/create`
3. Check Vercel function logs: `vercel logs --follow`
4. Verify Supabase connection in environment variables

### Issue: Emails not sending

**Solution**:
1. Check SendGrid dashboard: https://app.sendgrid.com/
2. Verify API key is valid: `curl -H "Authorization: Bearer $SENDGRID_API_KEY" https://api.sendgrid.com/v3/user/profile`
3. Check Vercel logs for email errors
4. Test email endpoint directly:
```bash
curl -X POST https://aiblueprint.educationaiblueprint.com/api/demo/emails/user-results \
  -H "Content-Type: application/json" \
  -d '{"leadData":{"first_name":"Test","last_name":"User","email":"your-email@test.com","institution_name":"Test U","institution_type":"K-12","role":"CIO"},"results":{"overallScore":67,"readinessLevel":"Emerging","categoryScores":{"Strategy & Vision":75},"quickWins":[],"estimatedImpact":{"costSavings":"$30K","timeSaved":"800hrs","efficiencyGain":"15%"},"percentile":58}}'
```

### Issue: Database errors

**Solution**:
1. Verify migration was applied: `SELECT * FROM demo_leads LIMIT 1;`
2. Check RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'demo_leads';`
3. Verify Supabase environment variables in Vercel
4. Check Supabase logs for connection errors

---

## 📈 Success Metrics

### Week 1 Goals
- [ ] 50+ visitors to demo page
- [ ] 10+ lead form submissions
- [ ] 8+ completed assessments (80% completion rate)
- [ ] 1-2 demo bookings

### Month 1 Goals
- [ ] 200+ visitors to demo page
- [ ] 40+ lead form submissions
- [ ] 32+ completed assessments (80% completion rate)
- [ ] 4-6 demo bookings
- [ ] 1-2 customer conversions

### Track with Dashboard Query:
```sql
-- Conversion funnel
WITH funnel AS (
  SELECT
    COUNT(*) FILTER (WHERE started_at IS NOT NULL) as started,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed,
    COUNT(*) FILTER (WHERE demo_scheduled = true) as demos,
    COUNT(*) FILTER (WHERE converted_to_customer = true) as customers
  FROM demo_leads
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT
  started as "Form Starts",
  completed as "Completions",
  ROUND(100.0 * completed / NULLIF(started, 0), 1) as "Completion %",
  demos as "Demos Scheduled",
  ROUND(100.0 * demos / NULLIF(completed, 0), 1) as "Demo %",
  customers as "Customers",
  ROUND(100.0 * customers / NULLIF(demos, 0), 1) as "Conversion %"
FROM funnel;
```

---

## 🎉 What's Live

Once deployed, you'll have:

✅ **Full demo assessment** at `/education-ai-blueprint-demo.html`  
✅ **API endpoints** at `/api/demo/leads/create` and `/api/demo/assessment/submit`  
✅ **Automated emails** with SendGrid integration  
✅ **Database** with RLS policies and indexes  
✅ **Lead qualification** (HOT/WARM/COLD) based on scores  
✅ **Quick wins generation** tailored to category gaps  
✅ **Impact estimation** (cost, time, efficiency)  
✅ **WordPress-embeddable** via iframe  
✅ **Mobile-responsive** design  
✅ **LocalStorage persistence** for save/resume  

---

## 🚀 Marketing Launch

### LinkedIn Announcement (copy/paste):

```
🎉 Exciting News! We've just launched a FREE AI Readiness Assessment for educational institutions.

In under 10 minutes, discover:
📊 Your institution's AI readiness score across 7 key categories
🎯 Personalized quick wins you can implement this month
💰 Estimated annual impact (cost savings, time saved, efficiency)

Perfect for:
• K-12 districts exploring AI adoption
• Colleges/universities building AI strategy
• EdTech leaders evaluating AI readiness

👉 Take the free assessment: https://educationaiblueprint.com/ai-readiness-demo

✓ No credit card required
✓ Instant results
✓ FERPA-compliant

#EdTech #AIinEducation #HigherEd #K12 #AIStrategy #EducationalLeadership
```

### Email Newsletter (send to existing contacts):

**Subject**: "🎯 New FREE Tool: Assess Your AI Readiness in 10 Minutes"

**Body**:
```
Hi [Name],

I'm excited to share a new resource I've built specifically for education leaders like you: a comprehensive AI Readiness Assessment.

In just 10 minutes, you'll discover:

✓ Your institution's overall AI readiness score
✓ Category-by-category breakdown (Strategy, Leadership, Faculty Readiness, Infrastructure, Privacy, Curriculum, Analytics)
✓ Personalized quick wins you can implement immediately
✓ Estimated annual impact from AI optimization

This is particularly valuable if you're:
- Building an AI strategic plan
- Exploring AI tools for your institution
- Preparing for board/leadership discussions about AI
- Benchmarking against peer institutions

Take the free assessment here:
https://educationaiblueprint.com/ai-readiness-demo

No credit card required • Instant results • 100% private & FERPA-compliant

Questions? Reply to this email or schedule a quick call: https://calendly.com/jeremyestrella/30min

Best,
Jeremy Estrella
Founder, NorthPath Strategies
```

---

## ✅ Final Checklist

Before going live:

- [ ] Database migration applied successfully
- [ ] Vercel deployment completed
- [ ] Demo page loads without errors
- [ ] Lead form submission works
- [ ] All 12 questions display correctly
- [ ] Results page shows scores and quick wins
- [ ] User results email received
- [ ] Sales notification email received
- [ ] WordPress iframe embeds properly
- [ ] Mobile responsive on iPhone/Android
- [ ] Google Analytics tracking (if applicable)
- [ ] LinkedIn announcement posted
- [ ] Email newsletter sent

---

**Estimated Time**: 30 minutes total (migration + deployment + testing + WordPress)

**Next Action**: Apply database migration → Deploy to production → Test end-to-end → Embed in WordPress → Launch marketing campaign

🚀 **Ready to launch!**

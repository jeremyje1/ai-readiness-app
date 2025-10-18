# Demo Tool Issue Resolution - October 18, 2025

## 🐛 Issues Encountered

### Issue #1: RLS Policy Violation (Error 42501)
**Error Message**:
```
Error creating demo lead: { 
  code: '42501', 
  details: null, 
  hint: null, 
  message: 'new row violates row-level security policy for table "demo_leads"' 
}
```

**Symptoms**:
- Demo form submission fails with 500 error
- User unable to start assessment
- Database insert blocked

**Root Cause**:
API routes were using regular Supabase client (`createClient()` from `@/lib/supabase/server`) which authenticates with user session. Since demo users are anonymous/unauthenticated, they don't have INSERT permissions under RLS policies.

**Solution** (from DEMO_REPLICATION_GUIDE.md Issue #3):
```typescript
// ❌ WRONG: Regular client respects RLS policies
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient(); // Uses auth session

// ✅ CORRECT: Admin client bypasses RLS
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Files Fixed**:
- `/app/api/demo/leads/create/route.ts` (line 86-96)
- `/app/api/demo/assessment/submit/route.ts` (line 338-348)

**Verification**:
```bash
# Test lead creation
curl -X POST https://aiblueprint.educationaiblueprint.com/api/demo/leads/create \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "institutionName": "Test University",
    "institutionType": "Four-Year College/University",
    "role": "Administrator"
  }'

# Expected: HTTP 200 with { "success": true, "leadId": "<uuid>" }
```

---

### Issue #2: Email Delivery Failures

**Symptoms**:
- Users not receiving results emails
- Sales team not getting lead notifications
- No errors in Vercel logs for email routes

**Potential Causes**:
1. ✅ SendGrid API key misconfigured → **Verified: Key is set correctly**
2. ✅ Email routes not called → **Verified: Routes exist and have CORS**
3. ⚠️ Assessment submit route failing before email calls → **FIXED with RLS fix**
4. ⚠️ SendGrid rate limits or domain verification

**Debugging Steps**:

1. **Check if assessment submit completes**:
```bash
# Monitor Vercel logs after submitting assessment
# Look for: "Assessment submitted successfully" log
```

2. **Test email routes directly**:
```bash
# Test user results email
curl -X POST https://aiblueprint.educationaiblueprint.com/api/demo/emails/user-results \
  -H "Content-Type: application/json" \
  -d '{
    "leadData": {
      "first_name": "Test",
      "last_name": "User",
      "email": "your-email@example.com",
      "institution_name": "Test University",
      "institution_type": "Four-Year College/University",
      "role": "Administrator"
    },
    "results": {
      "overallScore": 75,
      "readinessLevel": "Progressing",
      "categoryScores": {
        "Strategy & Vision": 80,
        "Leadership & Governance": 70
      },
      "quickWins": [],
      "estimatedImpact": {
        "costSavings": "$50,000",
        "timeSaved": "200 hours",
        "efficiencyGain": "35%"
      },
      "percentile": 68
    }
  }'
```

3. **Verify SendGrid configuration**:
```bash
# Check environment variables
vercel env ls | grep SENDGRID

# Expected output:
# SENDGRID_API_KEY (Encrypted) - Production
# SENDGRID_FROM_EMAIL (Encrypted) - Production  
# SENDGRID_TO_EMAIL (Encrypted) - Production
```

4. **Check SendGrid Activity Log**:
- Log into SendGrid dashboard
- Navigate to Activity Feed
- Filter by recipient email
- Check delivery status

---

## 📋 RLS Policy Reference

Current policies on `demo_leads` table:

```sql
-- Service role (API routes) - Full access
CREATE POLICY "Service role can do everything with demo_leads"
  ON demo_leads FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Anonymous users - INSERT only (public demo form)
CREATE POLICY "Anyone can create demo leads"
  ON demo_leads FOR INSERT TO anon
  USING (true) WITH CHECK (true);

-- Authenticated users - SELECT their own leads
CREATE POLICY "Users can read their own demo leads"
  ON demo_leads FOR SELECT TO authenticated
  USING (email = (auth.jwt() -> 'email')::text);
```

**Key Insight**: Since our API routes run server-side and need to insert/update for **any** user (not just authenticated ones), we must use `service_role` key.

---

## 🔍 Common Demo Issues (from DEMO_REPLICATION_GUIDE.md)

### Issue: Demo user authentication fails
**Solution**: Ensure demo credentials are set in environment variables:
```bash
DEMO_EMAIL=demo@platform.com
DEMO_PASSWORD=secure-password
DEMO_ORG_ID=uuid-here
```

### Issue: Tour doesn't start automatically
**Solution**: Add delay for DOM to render:
```typescript
setTimeout(() => {
  tour.start()
}, 1000)
```

### Issue: Countdown timer not updating
**Solution**: Ensure interval is set and state updates:
```typescript
const interval = setInterval(updateTime, 1000)
return () => clearInterval(interval) // Cleanup
```

---

## ✅ Post-Fix Verification Checklist

- [x] RLS policy violation fixed (service role key in use)
- [x] All tests passing (100 passed, 18 skipped)
- [x] TypeScript compilation clean
- [x] Deployed to production (https://aiblueprint.educationaiblueprint.com)
- [ ] **Test lead creation** via demo form
- [ ] **Test assessment submission** end-to-end
- [ ] **Verify user email** received
- [ ] **Verify sales notification** received
- [ ] **Check database** for new demo_leads record

---

## 🧪 End-to-End Testing Script

```bash
# 1. Visit demo page
open https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html

# 2. Fill out lead form
# - First Name: Test
# - Last Name: User  
# - Email: your-email@example.com
# - Institution: Test University
# - Type: Four-Year College/University
# - Role: Administrator

# 3. Complete all 12 questions
# - Use mixed responses (1-4 range)

# 4. View results page
# - Should show score, categories, quick wins

# 5. Check database
# Open Supabase → Table Editor → demo_leads
# Find record with your email

# 6. Check email inbox
# - User results email (from info@northpathstrategies.org)
# - Subject: "Your AI Readiness Results: X% (Level)"

# 7. Check sales inbox
# - Sales notification (to info@northpathstrategies.org)
# - Subject: "🎯 New Demo Lead: [HOT/WARM/COLD]"
```

---

## 📊 Monitoring Queries

**Check recent demo submissions**:
```sql
SELECT 
  created_at,
  email,
  institution_name,
  overall_score,
  lead_qualification,
  completed_at
FROM demo_leads
ORDER BY created_at DESC
LIMIT 10;
```

**Check completion rate**:
```sql
SELECT 
  COUNT(*) as total_leads,
  COUNT(completed_at) as completed,
  ROUND(100.0 * COUNT(completed_at) / COUNT(*), 2) as completion_rate
FROM demo_leads;
```

**Check qualification distribution**:
```sql
SELECT 
  lead_qualification,
  COUNT(*) as count,
  ROUND(AVG(overall_score), 1) as avg_score
FROM demo_leads
WHERE completed_at IS NOT NULL
GROUP BY lead_qualification
ORDER BY 
  CASE lead_qualification
    WHEN 'HOT' THEN 1
    WHEN 'WARM' THEN 2
    WHEN 'COLD' THEN 3
  END;
```

---

## 🚀 Deployment Log

**Date**: October 18, 2025  
**Time**: 04:51 UTC  
**Commit**: `c251639` - "fix: resolve RLS policy violation by using service role key in demo API routes"  
**Deployment**: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/5xRhqWfJZ6KQqYqrn9bw3j6mghVv  
**Status**: ✅ Deployed successfully

**Changes**:
- Fixed RLS error in `/api/demo/leads/create`
- Fixed RLS error in `/api/demo/assessment/submit`
- Switched from `@/lib/supabase/server` to `@supabase/supabase-js` with service role key
- Added detailed comments explaining why service role is needed

---

## 📝 Next Steps

1. **Test demo submission** manually
2. **Verify email delivery** (check both user + sales emails)
3. **Monitor Vercel logs** for any new errors
4. **Check Supabase logs** for RLS policy denials
5. **Update documentation** with any additional findings

---

## 🔗 References

- **DEMO_REPLICATION_GUIDE.md** - Common Issues & Debugging section
- **Supabase RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security
- **SendGrid Activity Feed**: https://app.sendgrid.com/email_activity
- **Vercel Logs**: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app

---

**Status**: ✅ **CRITICAL FIX DEPLOYED - READY FOR TESTING**

*Last updated: October 18, 2025 04:52 UTC*

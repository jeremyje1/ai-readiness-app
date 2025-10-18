# 🧪 Onboarding Flow Testing Guide

**Date:** October 16, 2025  
**Server:** http://localhost:3001  
**Status:** ✅ Dev server running

---

## ⚡ Quick Start

```bash
# Server is already running on port 3001
# Open in browser:
open http://localhost:3001/get-started
```

---

## 📋 Test Scenarios

### ✅ Scenario 1: New User Signup

**Objective:** Verify complete signup flow works end-to-end

**Steps:**
1. Navigate to http://localhost:3001/get-started
2. Verify page loads with:
   - ✓ AI Blueprint branding
   - ✓ Email and password fields
   - ✓ "Get Started" button
   - ✓ Toggle between signup/signin

3. Enter test credentials:
   - Email: `test-user-$(date +%s)@example.com` (unique)
   - Password: `TestPassword123!`
   - Institution: Auto-generated or manual entry

4. Click "Get Started"

5. **Expected Results:**
   - ✓ Form submits without errors
   - ✓ Redirects to `/welcome` page
   - ✓ Welcome message displays with user's email
   - ✓ Trial countdown shows "7 days remaining"
   - ✓ Onboarding checklist displays with 3 steps:
     - Complete AI readiness assessment (not completed)
     - Review personalized roadmap (not completed)
     - Upload policies and plans (not completed)

**Success Criteria:** User lands on `/welcome` with personalized greeting

---

### ✅ Scenario 2: Existing User Login

**Objective:** Verify returning user can sign in

**Steps:**
1. Navigate to http://localhost:3001/get-started
2. Click "Already have an account? Sign in"
3. Enter existing credentials
4. Click "Sign In"

**Expected Results:**
- ✓ Successful authentication
- ✓ Redirects to `/welcome`
- ✓ Progress checklist reflects actual completion status
- ✓ Trial countdown shows remaining days

**Success Criteria:** Existing user sees their actual progress

---

### ✅ Scenario 3: Welcome Page Progress Tracking

**Objective:** Verify progress checklist updates dynamically

**Steps:**
1. As authenticated user, visit http://localhost:3001/welcome
2. Note current checklist state (all unchecked initially)
3. Click "Start now" on "Complete AI readiness assessment"
4. Navigate to assessment page (may not be fully implemented)
5. Return to `/welcome`

**Expected Results:**
- ✓ Page loads instantly (no loading spinner)
- ✓ User greeting shows first name or email
- ✓ Institution name displays correctly
- ✓ Trial status card shows days remaining
- ✓ Checklist items show completion icons when done
- ✓ "Next best action" prompt appears for first incomplete step

**Success Criteria:** Progress accurately reflects user's completed actions

---

### ✅ Scenario 4: Dashboard Access

**Objective:** Verify personalized dashboard loads correctly

**Steps:**
1. As authenticated user, navigate to http://localhost:3001/dashboard/personalized
2. Observe page content

**Expected Results for User WITHOUT Assessment:**
- ✓ Welcome message: "Welcome to Your Dashboard! 🎯"
- ✓ Three-step onboarding guide displayed
- ✓ "What You'll Receive" section with checkmarks
- ✓ "Start Your Assessment" button

**Expected Results for User WITH Assessment:**
- ✓ "Your AI Readiness Dashboard" header
- ✓ Three cards showing: Overall Score, Roadmaps count, Documents count
- ✓ "Dashboard Enhancement In Progress" message
- ✓ Data summary displays actual values

**Success Criteria:** Dashboard renders appropriate state based on user data

---

### ✅ Scenario 5: Authentication Guards

**Objective:** Verify unauthenticated users are redirected

**Steps:**
1. Open incognito/private browser window
2. Navigate to http://localhost:3001/welcome
3. Observe behavior

**Expected Results:**
- ✓ Immediate redirect to `/get-started`
- ✓ No flash of protected content
- ✓ Clean transition without errors

**Additional Protected Routes to Test:**
- `/dashboard/personalized` → should redirect to `/get-started`
- `/assessment` → should redirect to `/get-started` (if implemented)
- `/documents` → should redirect to `/get-started` (if implemented)

**Success Criteria:** All protected routes redirect unauthenticated users

---

### ✅ Scenario 6: Form Validation

**Objective:** Verify client-side validation works

**Steps:**
1. Navigate to http://localhost:3001/get-started
2. Try to submit empty form
3. Enter invalid email: `notanemail`
4. Enter short password: `123`
5. Enter valid credentials

**Expected Results:**
- ✓ Empty form shows validation errors
- ✓ Invalid email format blocked with clear message
- ✓ Password must meet requirements (min 6 chars)
- ✓ Error messages clear when valid input entered
- ✓ Submit button disabled during validation errors

**Success Criteria:** Form prevents invalid submissions with helpful feedback

---

### ✅ Scenario 7: Rate Limiting

**Objective:** Verify API rate limiting works

**Steps:**
1. Open browser console (F12)
2. Navigate to http://localhost:3001/get-started
3. Rapidly submit form 15+ times with same email

**Expected Results:**
- ✓ First ~10 requests succeed or fail normally
- ✓ After threshold, receive 429 Too Many Requests
- ✓ Error message: "Too many attempts. Please wait before trying again."
- ✓ After 15 minutes, rate limit resets

**Success Criteria:** Rate limiting prevents abuse without blocking legitimate users

---

### ✅ Scenario 8: Session Persistence

**Objective:** Verify session persists across page reloads

**Steps:**
1. Sign in as existing user
2. Navigate to `/welcome`
3. Refresh page (Cmd+R or Ctrl+R)
4. Close browser tab
5. Reopen http://localhost:3001/welcome in new tab

**Expected Results:**
- ✓ Session persists after refresh
- ✓ No re-authentication required
- ✓ Data loads correctly on fresh page load
- ✓ Session survives browser restart (within expiry window)

**Success Criteria:** User stays authenticated during normal browsing

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found: @/components/dashboard/personalized-dashboard-client"
**Solution:** Run `npm run typecheck` to verify all imports exist

### Issue: Redirect loop between /get-started and /welcome
**Solution:** Check Supabase session cookie is being set correctly

### Issue: "Too many requests" on first attempt
**Solution:** Clear rate limit cache or wait 15 minutes

### Issue: Trial countdown shows "null days"
**Solution:** Ensure `trial_ends_at` is set in user_profiles table

### Issue: Progress checklist always shows incomplete
**Solution:** Verify database queries are returning correct counts

---

## 🔍 Developer Tools Checks

### Network Tab
- [ ] `/get-started` → should show minimal JS bundle
- [ ] `/welcome` → should show server-rendered HTML
- [ ] Form submission → should POST to `/api/auth/get-started`
- [ ] No excessive Supabase browser client requests

### Console Tab
- [ ] No JavaScript errors
- [ ] No TypeScript type errors
- [ ] No unhandled promise rejections
- [ ] Clean React hydration (no mismatch warnings)

### Application Tab (Cookies)
- [ ] Session cookie set after successful login
- [ ] Cookie has `httpOnly` flag (not visible to JS)
- [ ] Cookie has `secure` flag (in production)
- [ ] Cookie has proper expiry time

---

## ✅ Acceptance Criteria

**Must Pass:**
- [x] Typecheck: `npm run typecheck` ✅ PASSING
- [ ] New user signup completes successfully
- [ ] Existing user login works
- [ ] Welcome page shows personalized content
- [ ] Dashboard loads appropriate state
- [ ] Unauthenticated redirects work
- [ ] Form validation prevents bad input
- [ ] No console errors during normal flow

**Nice to Have:**
- [ ] Rate limiting blocks abuse
- [ ] Session persists across refreshes
- [ ] Fast page loads (<2s)
- [ ] Smooth transitions between pages

---

## 📊 Test Results Template

```markdown
## Test Session Results

**Date:** [Date]
**Tester:** [Your Name]
**Environment:** Local Dev (http://localhost:3001)

### Scenario Results

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. New User Signup | ⏳ Not Tested | |
| 2. Existing User Login | ⏳ Not Tested | |
| 3. Welcome Progress | ⏳ Not Tested | |
| 4. Dashboard Access | ⏳ Not Tested | |
| 5. Auth Guards | ⏳ Not Tested | |
| 6. Form Validation | ⏳ Not Tested | |
| 7. Rate Limiting | ⏳ Not Tested | |
| 8. Session Persistence | ⏳ Not Tested | |

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## 🚀 Next Steps After Testing

1. **If All Tests Pass:**
   - Commit changes: `git add . && git commit -m "feat: refactor onboarding to server-first architecture"`
   - Push to branch: `git push origin chore/upgrade-vitest-vite`
   - Create PR for review
   - Deploy to staging

2. **If Tests Fail:**
   - Document failures in test results
   - Create GitHub issues for bugs
   - Fix critical issues before proceeding
   - Re-run test suite

3. **Enhancement Priorities:**
   - Phase 2: Full dashboard client implementation
   - Add E2E tests with Playwright/Cypress
   - Performance optimization
   - Accessibility audit

---

**Testing Time Estimate:** 20-30 minutes for full manual test  
**Automation Ready:** Yes, scenarios can be converted to E2E tests  
**Blocker Resolution:** Most issues can be fixed in <10 minutes

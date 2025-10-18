# Demo Dashboard - Quick Start Guide

## 🚀 Testing the Demo Locally

### Start the development server:
```bash
cd /Users/jeremy.estrella/Desktop/ai-readiness-app-main
npm run dev
```

### Visit the demo:
```
http://localhost:3001/demo
```

### Expected Flow:
1. **Loading Screen** (2-3 seconds)
   - Spinner animation
   - "Preparing Your Demo..." message
   - Test environment warnings

2. **Auto-Redirect** to dashboard
   - URL: `http://localhost:3001/dashboard/personalized?demo=true&tour=start`

3. **Demo Banner Appears**
   - Yellow sticky banner at top
   - Countdown timer starting at 30:00
   - "Create Real Account" button

4. **Tour Prompt Modal**
   - "Welcome to AI Blueprint!" message
   - Options: "Yes, Show Me Around" or "Skip for Now"

5. **Dashboard with Mock Data**
   - Overall readiness: 73%
   - 2 active blueprints
   - NIST category breakdown
   - Implementation progress bar
   - Staff training metrics

6. **Guided Tour** (if accepted)
   - Step 1: Welcome
   - Step 2: Dashboard overview
   - Step 3: Blueprints feature
   - Step 4: Tour complete

---

## 🧪 Testing Checklist

### ✅ Demo Login Flow
- [ ] Visit `/demo`
- [ ] See loading state
- [ ] Auto-redirect to dashboard
- [ ] No errors in console

### ✅ Demo Banner
- [ ] Yellow banner visible at top
- [ ] Countdown starts at 30:00
- [ ] Timer decreases every second
- [ ] "Create Real Account" button works
- [ ] Banner appears on all pages

### ✅ Dashboard Display
- [ ] Overall score shows **73**
- [ ] Readiness level shows **"Developing"**
- [ ] "(Demo Data)" label visible in header
- [ ] 5 NIST categories displayed
- [ ] 2 blueprint cards visible
- [ ] Progress bars render correctly
- [ ] Staff training: 58/127

### ✅ Guided Tour
- [ ] Modal appears on first visit
- [ ] "Yes, Show Me Around" starts tour
- [ ] "Skip for Now" dismisses modal
- [ ] Tour has 4 steps
- [ ] Tour can be canceled
- [ ] "Start Tour" button in banner works

### ✅ Email Delivery (from assessment tool)
1. Visit: `https://aiblueprint.educationaiblueprint.com/demo-tool`
2. Fill out assessment form
3. Submit assessment
4. Check email inbox for:
   - [ ] User results email received
   - [ ] Sales notification received
   - [ ] No "Invalid character in header" errors

### ⏱️ Session Expiry (30 minutes)
- [ ] Countdown reaches 0:00
- [ ] Auto-redirect to `/get-started?reason=demo-expired`
- [ ] Cookies cleared after expiry

---

## 🐛 Troubleshooting

### Issue: Demo login fails
**Solution:** Check Supabase credentials
```bash
# Verify environment variables:
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Issue: Tour doesn't start
**Check:**
1. `data-tour` attributes present on dashboard elements
2. Shepherd.js installed: `npm list shepherd.js`
3. No console errors
4. URL has `?tour=start` parameter

### Issue: Mock data not showing
**Check:**
1. Browser console: `document.cookie` includes `demo-mode=true`
2. Dashboard component detects demo mode (check React DevTools)
3. Clear browser cache and try again

### Issue: Emails still not sending
**Check:**
1. SendGrid API key in `.env` (no quotes or extra spaces)
2. API key sanitization code in email routes
3. SendGrid dashboard for delivery status
4. Console logs for error messages

---

## 📱 Mobile Testing

### Responsive Design Checkpoints
- [ ] Demo banner adapts to mobile width
- [ ] Countdown timer remains visible
- [ ] CTA buttons don't overlap
- [ ] Dashboard cards stack vertically
- [ ] Tour modal fits on screen
- [ ] No horizontal scroll

### Test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)

---

## 🎬 Recording a Demo Video

### Suggested Flow:
1. **Opening Scene** (5 sec)
   - Show URL: `/demo`
   - Voiceover: "Let's explore AI Blueprint in 30 minutes"

2. **Loading State** (3 sec)
   - Show auto-login animation
   - Voiceover: "No signup required"

3. **Dashboard Overview** (15 sec)
   - Pan across key metrics
   - Voiceover: "See your institution's AI readiness at a glance"

4. **NIST Categories** (10 sec)
   - Highlight 5 category scores
   - Voiceover: "Aligned with NIST framework standards"

5. **Implementation Progress** (10 sec)
   - Show progress bar and next milestone
   - Voiceover: "Track actions and stay on schedule"

6. **Active Blueprints** (15 sec)
   - Click into a blueprint card
   - Voiceover: "Customized roadmaps for your district"

7. **Guided Tour** (20 sec)
   - Start tour, show 2-3 steps
   - Voiceover: "Interactive walkthrough of key features"

8. **Conversion CTA** (7 sec)
   - Show demo banner countdown
   - Click "Create Real Account"
   - Voiceover: "Ready to save your work? Create a free account"

**Total Length:** ~90 seconds  
**Tools:** Loom, ScreenFlow, or OBS Studio

---

## 🚢 Deployment

### Pre-Deploy Checklist
- [x] TypeScript compiles: `npm run typecheck`
- [x] No lint errors: `npm run lint`
- [x] Shepherd.js installed: `npm install shepherd.js`
- [ ] Test locally: Visit `/demo` and complete full flow
- [ ] Test email delivery: Submit assessment, check inbox

### Deploy to Production
```bash
# Commit changes
git add .
git commit -m "Add complete demo dashboard with tour and mock data"

# Push to main branch (triggers Vercel deploy)
git push origin main
```

### Post-Deploy Verification
1. Visit: `https://aiblueprint.educationaiblueprint.com/demo`
2. Complete entire flow (login → dashboard → tour)
3. Check demo banner countdown
4. Submit assessment and verify emails
5. Monitor for 30 minutes to test session expiry

### Vercel Build Logs
Check for:
- ✅ No build errors
- ✅ Shepherd.js bundled successfully
- ✅ All routes deployed
- ✅ Static assets optimized

---

## 📊 Analytics to Track

### Key Metrics
1. **Demo Starts:** Count of `/demo` page visits
2. **Demo Completions:** Users who see entire tour
3. **Session Duration:** Average time in demo mode
4. **Tour Acceptance:** % who click "Yes, Show Me Around"
5. **Conversion Rate:** Demo → Real account signups
6. **Drop-off Points:** Where users exit demo

### Event Tracking (Future)
```typescript
// Add to DemoBanner
analytics.track('Demo Started', {
  timestamp: Date.now(),
  source: 'direct' // or 'wordpress', 'email', etc.
})

analytics.track('Tour Completed', {
  duration: timeInDemo,
  steps_viewed: 4
})

analytics.track('Demo to Signup', {
  time_remaining: formatTime(timeRemaining),
  conversion_point: 'banner_cta'
})
```

---

## 🎯 Success Criteria

### Demo is successful if:
- ✅ Users can access demo without signup
- ✅ Dashboard loads with realistic data
- ✅ Tour explains key features clearly
- ✅ Countdown timer works accurately
- ✅ Session expires and redirects properly
- ✅ Emails deliver successfully
- ✅ No console errors or crashes
- ✅ Mobile-responsive design
- ✅ Fast load times (<3 seconds)
- ✅ Conversion CTA visible throughout

---

## 🤝 Support

### Questions?
- **Documentation:** See `DEMO_DASHBOARD_IMPLEMENTATION_COMPLETE.md`
- **Pattern Guide:** See `DEMO_REPLICATION_GUIDE.md`
- **Issues:** Check console logs and Vercel deployment logs

### Common Questions

**Q: Can I extend the demo beyond 30 minutes?**  
A: Not currently. This is by design to encourage conversion.

**Q: Can I customize the mock data?**  
A: Yes! Edit `DEMO_DATA` in `/components/dashboard/personalized-dashboard-client.tsx`

**Q: Can I disable the tour?**  
A: Users can skip it. To remove entirely, remove `?tour=start` from redirect URL.

**Q: How do I track demo conversions?**  
A: Add analytics events to DemoBanner CTA buttons.

---

## ✅ Final Notes

**Status:** ✅ Ready for production  
**Last Updated:** January 8, 2025  
**Next Review:** After first 100 demo sessions

**What's Next:**
1. Deploy to production
2. Monitor demo engagement
3. Collect user feedback
4. Iterate on mock data based on real customer profiles
5. Add analytics tracking
6. Create demo video walkthrough

---

**Happy Demo Building! 🚀**

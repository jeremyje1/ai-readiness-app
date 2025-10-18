# WordPress Integration Guide for Education AI Blueprint Demo

**Date**: October 18, 2025  
**Purpose**: Instructions for embedding the AI Readiness Demo into WordPress static site

---

## 🎯 Overview

The Education AI Blueprint demo tool is now available at:
- **Next.js Route**: `https://aiblueprint.educationaiblueprint.com/ai-readiness-demo`
- **Static HTML**: `https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html`

Both URLs serve the same interactive assessment tool with full API integration.

---

## 📋 Integration Options

### **Option 1: iFrame Embed (Recommended for WordPress)**

Add this code to your WordPress page or post:

```html
<iframe 
  src="https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html"
  width="100%" 
  height="1600px"
  frameborder="0"
  style="border: none; display: block; max-width: 100%;"
  title="AI Readiness Assessment">
</iframe>

<script>
// Auto-adjust iframe height based on content
window.addEventListener('message', function(e) {
  if (e.data.type === 'resize' && e.data.height) {
    document.querySelector('iframe').style.height = e.data.height + 'px';
  }
});
</script>
```

**Pros**:
- ✅ Easy to implement (copy/paste)
- ✅ No code changes needed
- ✅ Maintains Next.js backend API integration
- ✅ Automatic updates when we deploy

**Cons**:
- ⚠️ Fixed height (1600px) - may need adjustment for mobile
- ⚠️ Requires custom HTML block in WordPress

---

### **Option 2: Direct Link to Dedicated Page**

Create a WordPress page that redirects to:
```
https://aiblueprint.educationaiblueprint.com/ai-readiness-demo
```

**In WordPress**:
1. Create new page: "AI Readiness Assessment"
2. Install "Redirection" plugin or use custom PHP
3. Set 301 redirect to demo URL

**Pros**:
- ✅ Full-page experience (no iframes)
- ✅ Better for SEO
- ✅ Cleaner URL management

**Cons**:
- ⚠️ Leaves WordPress domain
- ⚠️ May confuse users about where they are

---

### **Option 3: WordPress Menu Link**

Add direct link to WordPress navigation menu:

**Steps**:
1. WordPress Admin → Appearance → Menus
2. Add Custom Link:
   - URL: `https://aiblueprint.educationaiblueprint.com/ai-readiness-demo`
   - Link Text: "Free AI Assessment" or "Try Demo"
3. Save Menu

**Pros**:
- ✅ Simplest implementation
- ✅ No page creation needed
- ✅ Maintains distinct branding

**Cons**:
- ⚠️ External link (users leave WordPress site)

---

### **Option 4: Full Integration (Advanced)**

For WordPress developers who want native integration:

**Steps**:
1. Download standalone HTML from `/public/education-ai-blueprint-demo.html`
2. Create WordPress template: `page-ai-demo.php`
3. Copy HTML content into template
4. Update API URLs to point to live backend:
   ```javascript
   const API_BASE = 'https://aiblueprint.educationaiblueprint.com'
   ```
5. Create WordPress page with "AI Demo" template

**Pros**:
- ✅ Native WordPress integration
- ✅ Full control over styling
- ✅ Can customize branding

**Cons**:
- ⚠️ Requires PHP/WordPress development skills
- ⚠️ Must manually update when we change demo code
- ⚠️ More complex to maintain

---

## 🚀 Recommended Implementation

### **Step-by-Step: iFrame Embed**

1. **Log into WordPress Admin**
2. **Create New Page** (or edit existing)
   - Title: "AI Readiness Assessment" or "Try Our Demo"
   - Slug: `/ai-demo` or `/assessment`

3. **Add Custom HTML Block**
   - Click "+" → Search "Custom HTML"
   - Paste this code:

```html
<!-- AI Readiness Demo Container -->
<div style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
  <!-- Optional: Add intro text above demo -->
  <div style="text-align: center; margin-bottom: 2rem;">
    <h2>Discover Your Institution's AI Readiness</h2>
    <p style="font-size: 1.125rem; color: #6b7280;">
      Complete this 10-minute assessment to get personalized recommendations 
      and a custom roadmap for responsible AI adoption.
    </p>
  </div>

  <!-- Embedded Demo -->
  <iframe 
    src="https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html"
    width="100%" 
    height="1600px"
    frameborder="0"
    style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
    title="AI Readiness Assessment"
    loading="lazy">
  </iframe>
</div>

<!-- Mobile-friendly height adjustment -->
<style>
@media (max-width: 768px) {
  iframe {
    height: 2000px !important; /* Taller on mobile due to stacked layout */
  }
}
</style>
```

4. **Preview** → Check desktop and mobile
5. **Publish**

---

## 📱 Mobile Optimization

The demo is fully responsive, but iframe heights may need adjustment:

```css
/* Add to WordPress theme's Additional CSS */
@media (max-width: 640px) {
  .wp-block-html iframe {
    height: 2200px !important;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .wp-block-html iframe {
    height: 1800px !important;
  }
}
```

---

## 🔗 URL Structure

After implementation, users can access the demo via:

| URL | Source | Use Case |
|-----|--------|----------|
| `educationaiblueprint.com/ai-demo` | WordPress page | Marketing page with iframe embed |
| `educationaiblueprint.com/assessment` | WordPress redirect | Direct link from email campaigns |
| `aiblueprint.educationaiblueprint.com/ai-readiness-demo` | Next.js route | Standalone full-page experience |
| `aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html` | Static HTML | Direct access (used in iframe) |

---

## ✅ Testing Checklist

After embedding in WordPress:

- [ ] **Desktop**: Form loads, all 12 questions display
- [ ] **Mobile**: Assessment works on iPhone/Android
- [ ] **Tablet**: Layout responsive on iPad
- [ ] **Form Submission**: Lead data saves to database
- [ ] **Email Delivery**: User receives results email
- [ ] **Sales Notification**: Sales team receives lead alert
- [ ] **UTM Tracking**: Campaign parameters captured (if using)
- [ ] **LocalStorage**: Progress saves when user refreshes
- [ ] **Results Page**: Scores, recommendations, CTAs display correctly
- [ ] **No Console Errors**: Check browser DevTools
- [ ] **HTTPS**: Page loads over secure connection

---

## 🎨 Customization Options

### **Add WordPress Header/Footer**

Keep WordPress navigation while embedding demo:

```html
<!-- Standard WordPress Page -->
<!-- WordPress header/nav loads automatically -->

<div class="demo-wrapper" style="padding: 2rem 0;">
  <iframe src="https://aiblueprint.educationaiblueprint.com/..."></iframe>
</div>

<!-- WordPress footer loads automatically -->
```

### **Match WordPress Theme Colors**

Add CSS to blend iframe with WordPress theme:

```css
.demo-wrapper iframe {
  border: 2px solid var(--wp-primary-color);
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}
```

### **Add Pre/Post Demo Content**

```html
<!-- Before Demo -->
<div class="pre-demo-content">
  <h2>Why Take This Assessment?</h2>
  <ul>
    <li>✅ Get personalized AI recommendations</li>
    <li>✅ Understand your readiness level</li>
    <li>✅ Receive custom implementation roadmap</li>
  </ul>
</div>

<!-- Demo iFrame -->
<iframe src="..."></iframe>

<!-- After Demo (shown after completion) -->
<div class="post-demo-cta">
  <h3>Ready to Move Forward?</h3>
  <a href="/contact" class="btn btn-primary">Schedule a Consultation</a>
</div>
```

---

## 🐛 Troubleshooting

### **Issue: iFrame not showing**
**Solution**: Check if WordPress theme has Content Security Policy (CSP) blocking iframes. Add to `.htaccess`:
```apache
Header set Content-Security-Policy "frame-src 'self' https://aiblueprint.educationaiblueprint.com;"
```

### **Issue: Form submission fails**
**Solution**: Check browser console for CORS errors. API should already have CORS enabled, but verify:
```bash
# Test API endpoint
curl -H "Origin: https://educationaiblueprint.com" \
  https://aiblueprint.educationaiblueprint.com/api/demo/leads/create
```

### **Issue: Height too short/tall**
**Solution**: Adjust iframe height based on content:
```javascript
// Add to WordPress page
<script>
window.addEventListener('message', (e) => {
  if (e.origin === 'https://aiblueprint.educationaiblueprint.com') {
    const iframe = document.querySelector('iframe');
    if (e.data.height) iframe.style.height = e.data.height + 'px';
  }
});
</script>
```

### **Issue: Mobile layout broken**
**Solution**: Use different heights for mobile:
```css
@media (max-width: 768px) {
  iframe { height: 2200px !important; }
}
```

---

## 📊 Analytics Integration

### **Track Demo Views in WordPress**

Add to functions.php:
```php
add_action('wp_footer', function() {
  if (is_page('ai-demo')) {
    ?>
    <script>
      gtag('event', 'demo_view', {
        'event_category': 'engagement',
        'event_label': 'AI Readiness Demo'
      });
    </script>
    <?php
  }
});
```

### **Track Completions**

The demo already sends events to our backend. To track in WordPress/Google Analytics, add:
```javascript
window.addEventListener('message', (e) => {
  if (e.data.type === 'assessment_complete') {
    gtag('event', 'assessment_complete', {
      'score': e.data.score,
      'qualification': e.data.qualification
    });
  }
});
```

---

## 🚦 Go-Live Checklist

Before launching WordPress integration:

- [ ] Demo accessible at both URLs (Next.js route + static HTML)
- [ ] WordPress page created with embed code
- [ ] Mobile responsive (tested on iPhone, Android, iPad)
- [ ] Form submissions saving to database (verify in Supabase)
- [ ] Emails sending correctly (user results + sales notification)
- [ ] UTM parameters working (test with `?utm_source=wordpress&utm_campaign=demo`)
- [ ] Analytics tracking configured
- [ ] WordPress menu link added (if applicable)
- [ ] SSL certificate active (HTTPS)
- [ ] No console errors in browser DevTools
- [ ] Performance tested (PageSpeed, Lighthouse)

---

## 📝 Example WordPress Page Structure

**Full Page Code** (copy/paste into WordPress Custom HTML block):

```html
<!-- Hero Section -->
<div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; padding: 4rem 2rem; text-align: center; border-radius: 16px; margin-bottom: 3rem;">
  <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem;">
    Discover Your AI Readiness in 10 Minutes
  </h1>
  <p style="font-size: 1.25rem; opacity: 0.95; max-width: 700px; margin: 0 auto;">
    Get personalized recommendations and a custom roadmap for responsible AI adoption
  </p>
</div>

<!-- Demo Embed -->
<div style="max-width: 1000px; margin: 0 auto;">
  <iframe 
    src="https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html"
    width="100%" 
    height="1600px"
    frameborder="0"
    style="border: none; border-radius: 8px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);"
    title="AI Readiness Assessment">
  </iframe>
</div>

<!-- CTA Section -->
<div style="background: #f3f4f6; padding: 3rem 2rem; text-align: center; border-radius: 16px; margin-top: 3rem;">
  <h2 style="font-size: 2rem; margin-bottom: 1rem;">Ready to Implement AI Responsibly?</h2>
  <p style="font-size: 1.125rem; color: #6b7280; margin-bottom: 2rem;">
    Schedule a consultation with our AI strategy experts to create your custom roadmap.
  </p>
  <a href="/contact" style="display: inline-block; background: #1e40af; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
    Schedule a Consultation →
  </a>
</div>

<!-- Mobile Optimization -->
<style>
@media (max-width: 768px) {
  iframe { height: 2000px !important; }
}
</style>
```

---

## ✅ Summary

**Best Implementation**: iFrame embed in WordPress Custom HTML block

**URL to Embed**: `https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html`

**Height Settings**:
- Desktop: 1600px
- Tablet: 1800px  
- Mobile: 2000px

**Status**: ✅ Demo deployed and ready for WordPress integration

---

## 📞 Support

Questions about integration? Contact:
- **Technical Issues**: Check `/api/demo/*` logs in Vercel dashboard
- **Database**: Query `demo_leads` table in Supabase
- **WordPress**: Verify iframe code in page HTML source

**Demo URLs**:
- Next.js: https://aiblueprint.educationaiblueprint.com/ai-readiness-demo
- Static: https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html

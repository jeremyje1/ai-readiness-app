# 🎯 Quick Reference: WordPress Integration

## ✅ Demo is Live!

**URLs**:
- Next.js: `https://aiblueprint.educationaiblueprint.com/ai-readiness-demo`
- Static HTML: `https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html`

---

## 📝 WordPress Embed Code (Copy/Paste)

```html
<div style="max-width: 1000px; margin: 2rem auto;">
  <iframe 
    src="https://aiblueprint.educationaiblueprint.com/education-ai-blueprint-demo.html"
    width="100%" 
    height="1600px"
    frameborder="0"
    style="border: none; border-radius: 8px;"
    title="AI Readiness Assessment">
  </iframe>
</div>

<style>
@media (max-width: 768px) {
  iframe { height: 2000px !important; }
}
</style>
```

---

## 🚀 Quick Setup Steps

1. **WordPress Admin** → Pages → Add New
2. **Title**: "AI Readiness Assessment"
3. **Add Block** → Custom HTML
4. **Paste** code above
5. **Publish**

Done! ✅

---

## 📊 What Happens When User Submits

1. Lead data saved to `demo_leads` table
2. User receives results email (SendGrid)
3. Sales team receives notification email
4. UTM parameters tracked (if used)
5. Results page shows score + recommendations

---

## 🔍 Testing

**Quick Test**:
```bash
# Visit this URL in browser:
https://aiblueprint.educationaiblueprint.com/ai-readiness-demo

# Fill out form → Complete assessment → Check database:
# Supabase → Table Editor → demo_leads → View records
```

---

## 📞 Need Help?

- **Docs**: `WORDPRESS_INTEGRATION_GUIDE.md` (full instructions)
- **Deployment**: `DEPLOYMENT_SUCCESS_OCT18.md` (detailed status)
- **Database**: Supabase project `jocigzsthcpspxfdfxae`
- **Logs**: Vercel dashboard → ai-readiness-app

---

**Status**: ✅ Ready for WordPress integration  
**Next Step**: Create WordPress page with embed code above

# Production Environment Variables Configuration

## 🚀 **URGENT: Set These in Your Vercel Dashboard**

Go to: https://vercel.com/jeremys-projects-73929cad/ai-readiness-app/settings/environment-variables

### **Required Environment Variables:**

```bash
# Authentication
NEXTAUTH_URL=https://aireadiness.northpathstrategies.org
NEXTAUTH_SECRET=your-secure-nextauth-secret-here

# Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Stripe Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# App URLs
NEXT_PUBLIC_APP_URL=https://aireadiness.northpathstrategies.org
NEXT_PUBLIC_BASE_URL=https://aireadiness.northpathstrategies.org
```

### **How to Generate NEXTAUTH_SECRET:**

Run this command in your terminal:
```bash
openssl rand -base64 32
```

### **Critical Issues Without These Variables:**
- ❌ Authentication won't work
- ❌ Welcome emails won't send
- ❌ Stripe checkout will fail
- ❌ AI features won't function

### **Domain Setup:**

1. Go to your Vercel dashboard
2. Navigate to Project Settings > Domains
3. Add: `aireadiness.northpathstrategies.org`
4. Configure DNS if needed

### **Testing Checklist:**

After setting variables:
- [ ] Test sign up flow
- [ ] Test welcome email delivery
- [ ] Test Stripe checkout
- [ ] Test dashboard access
- [ ] Test login functionality

---

**Created:** August 6, 2025
**Status:** URGENT - Required for production

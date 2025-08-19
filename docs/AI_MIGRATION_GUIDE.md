# AI Readiness App Migration Guide

## ✅ Project Setup Complete
The AI readiness app has been created at `../ai-readiness-app/` with:
- ✅ Next.js 14 installed
- ✅ TypeScript configured  
- ✅ Basic project structure
- ✅ Package.json with dependencies
- ✅ Port 3001 (separate from main app)

## 🚚 Files to Migrate

### 1. App Routes (Move these directories)
```bash
# From main app to AI app
app/ai-readiness/     → ../ai-readiness-app/app/ai-readiness/
app/ai-blueprint/     → ../ai-readiness-app/app/ai-blueprint/
app/api/ai-readiness/ → ../ai-readiness-app/app/api/ai-readiness/
app/api/ai-blueprint/ → ../ai-readiness-app/app/api/ai-blueprint/
app/api/ai-transformation/ → ../ai-readiness-app/app/api/ai-transformation/
```

### 2. Library Files (Move these files)
```bash
# AI-specific libraries
lib/ai-*.ts                    → ../ai-readiness-app/lib/
lib/aiOpportunityMapGenerator.ts → ../ai-readiness-app/lib/
lib/aiReadinessDatabase.ts     → ../ai-readiness-app/lib/
lib/aiReadinessEngine.ts       → ../ai-readiness-app/lib/
lib/ai-blueprint-*.ts          → ../ai-readiness-app/lib/
lib/ai-partnership-service.ts  → ../ai-readiness-app/lib/
lib/ai-readiness-*.ts          → ../ai-readiness-app/lib/
lib/ai-transformation-*.ts     → ../ai-readiness-app/lib/
```

### 3. Data Files
```bash
data/ai_readiness_questions*.json → ../ai-readiness-app/data/
data/ai_*.json                     → ../ai-readiness-app/data/
```

### 4. Components (AI-specific components)
```bash
# Any components specifically for AI functionality
components/ai/ → ../ai-readiness-app/components/ai/
```

## 🔧 Configuration Files Needed

### Next.js Config (`../ai-readiness-app/next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  async redirects() {
    return [
      {
        source: '/ai-readiness',
        destination: '/ai-readiness/start',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Environment Variables (`../ai-readiness-app/.env.local`)
```bash
# Copy from main app and modify:
NEXT_PUBLIC_DOMAIN=ai.northpathstrategies.org
NEXT_PUBLIC_APP_URL=https://ai.northpathstrategies.org

# Database (can share or separate)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...

# OpenAI for AI analysis
OPENAI_API_KEY=sk-...

# Stripe for AI-specific pricing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_AI_PULSE_CHECK_PRICE_ID=price_...
STRIPE_AI_COMPREHENSIVE_PRICE_ID=price_...
```

## 🚀 Running Both Apps

### Main Organizational App (Port 3000)
```bash
cd organizational_realign_app
npm run dev
```

### AI Readiness App (Port 3001)  
```bash
cd ai-readiness-app
npm run dev
```

## 📝 Steps to Complete Migration

1. **Move app routes**: Copy AI-related pages and API routes
2. **Move library files**: Copy AI-specific utility functions
3. **Update imports**: Fix all import paths in moved files
4. **Copy shared components**: Move UI components used by AI features
5. **Configure environment**: Set up separate environment variables
6. **Test functionality**: Ensure AI assessments work in new app
7. **Update navigation**: Remove AI links from main app
8. **Deploy separately**: Set up independent deployment

## ⚡ Performance Benefits Expected

- **Main app**: 50-60% fewer files (remove ~200 AI files)
- **AI app**: Focused functionality, faster builds
- **VS Code**: Better performance with smaller project scope
- **Deployment**: Faster deploys for each app
- **Maintenance**: Clearer separation of concerns

## 🔗 Cross-App Communication (if needed)

If the apps need to communicate:
- **Shared database**: Both apps can use same Supabase instance
- **API calls**: Main app can call AI app APIs if needed
- **Redirects**: Main app can redirect to AI app for assessments
- **Shared components**: Use npm packages for shared UI components

## Next Steps

Would you like me to:
1. **Start the file migration** by moving the app routes?
2. **Create the configuration files** for the AI app?
3. **Set up shared components** library?
4. **Configure deployment** for both apps?

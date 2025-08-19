# Authentication & Database Setup Guide

## Overview
Your organizational realignment app is successfully deployed but needs authentication and database configuration to enable the full survey functionality.

## Current Status ✅
- **Build**: Clean TypeScript compilation (0 errors)
- **Deployment**: Production deployment on Vercel
- **Question Bank**: Comprehensive 1700+ questions with institution filtering
- **Database Schema**: Supabase tables ready (`survey_responses`, existing auth tables)

## Setup Required 🔧

### 1. Supabase Project Setup

1. **Create/Access Supabase Project**:
   ```bash
   # Visit https://supabase.com/dashboard
   # Create new project or access existing one
   ```

2. **Get Credentials**:
   - Project URL: `https://your-project-id.supabase.co`
   - Anon Key: Found in Settings > API
   - Database Password: Set during project creation

3. **Update Environment Variables**:
   ```bash
   # Copy .env.example to .env.local
   cp .env.example .env.local
   
   # Edit .env.local with your actual Supabase values:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
   ```

### 2. Database Schema Setup

Your database already has the required tables. To verify/create them:

```sql
-- Verify existing tables in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('survey_responses', 'institutions', 'questions');
```

### 3. Question Bank Integration

The app uses the comprehensive question bank from TypeScript files rather than database storage for better performance and type safety.

**Question Bank Features**:
- ✅ 1700+ questions across all organizational areas
- ✅ Institution type filtering (Community College, University, Healthcare, etc.)
- ✅ Priority levels and tagging system
- ✅ Multiple question types (Likert, Select, Multi-select, Numeric)

### 4. Authentication Configuration

The app is configured for Supabase Auth with these features:
- Email/password authentication
- Social login (configurable)
- Row Level Security (RLS) enabled
- User session management

### 5. Testing Authentication

1. **Enable Auth in Survey**:
   ```typescript
   // In app/survey/page.tsx, uncomment:
   import { useUser } from "@supabase/auth-helpers-react";
   const user = useUser(); // Replace: const user = null;
   ```

2. **Test Authentication Flow**:
   - Visit `/auth` for login/signup
   - Complete survey as authenticated user
   - Verify responses save to `survey_responses` table

## Quick Start Commands

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

## Verification Checklist

- [ ] Supabase project created/accessible
- [ ] Environment variables configured in `.env.local`
- [ ] Database tables verified in Supabase dashboard
- [ ] Authentication enabled in survey page
- [ ] Survey responses saving to database
- [ ] Institution type filtering working
- [ ] All question sections accessible

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Database connection errors**: Verify `DATABASE_URL` format
3. **Questions not loading**: Check `comprehensiveQuestionBank.ts` import
4. **Auth redirect issues**: Verify Supabase Auth URL settings

### Debug Pages Available:
- `/survey/simple-debug` - Working survey without auth
- Comprehensive logging in browser console

## Next Steps After Setup

1. **Configure Stripe** (for paid tiers):
   - Add Stripe keys to environment
   - Test payment integration

2. **Email Configuration**:
   - Configure SMTP in Supabase
   - Set up email templates

3. **Analytics**:
   - Add Google Analytics
   - Set up conversion tracking

4. **Additional Features**:
   - Organization management
   - Collaborative assessments
   - PDF report generation

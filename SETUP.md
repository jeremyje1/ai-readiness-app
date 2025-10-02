# AI Readiness Platform - Setup Guide

This guide walks you through setting up the AI Readiness Platform with its new streamlined assessment, document upload, and AI-powered gap analysis features.

## 🚀 Quick Start

Run these commands to set up everything automatically:

```bash
# Install dependencies
npm install

# Set up database tables and storage
npm run setup:all

# Verify the setup
npm run verify:setup
```

## 📋 Prerequisites

1. **Supabase Project**: Active Supabase project ([https://supabase.com](https://supabase.com))
2. **OpenAI API Key**: For AI document analysis ([https://platform.openai.com](https://platform.openai.com))
3. **Stripe Account**: For payment processing (already configured)
4. **Node.js**: Version 18+ installed

## 🔧 Automated Setup

### 1. Database Setup

Run the database setup script to create all required tables:

```bash
npm run setup:database
```

This creates:
- `uploaded_documents` - Stores document metadata and analysis
- `streamlined_assessment_responses` - Stores strategic assessment answers
- `gap_analysis_results` - Stores NIST framework gap analysis
- `implementation_roadmaps` - Stores 30/60/90-day action plans
- `user_activity_log` - Tracks user activities

All tables include:
- Row Level Security (RLS) enabled
- Proper indexes for performance
- User-based access policies

### 2. Storage Setup

Create the storage bucket for document uploads:

```bash
npm run setup:storage
```

This creates:
- Storage bucket named `documents`
- 10MB file size limit
- Accepts PDF and Word documents only
- RLS policies for user-based access

### 3. Verify Setup

Check that everything is configured correctly:

```bash
npm run verify:setup
```

This verifies:
- ✅ Environment variables are set
- ✅ Database tables exist with RLS
- ✅ Storage bucket is accessible
- ✅ OpenAI API key is valid

## 🔑 Environment Variables

Create a `.env.local` file with these variables:

```env
# Supabase (Public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase (Private)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Stripe (Already configured)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

## 📝 Manual Setup (If Automated Fails)

### Option A: Supabase Dashboard - SQL Editor

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the SQL from `/tmp/create_tables.sql`
3. Run the SQL to create all tables

### Option B: Supabase Dashboard - Storage

1. Go to Storage → New Bucket
2. Configure:
   - **Name**: `documents`
   - **Public**: No (private)
   - **File size limit**: 10 MB
   - **Allowed MIME types**:
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. Apply RLS policies in SQL Editor:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own documents
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own documents
CREATE POLICY "Users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 🧪 Testing the Full Flow

### 1. User Registration
- Navigate to `/auth/signup`
- Create a new account
- Complete email verification

### 2. Payment Flow
- Complete Stripe checkout ($199/month with 7-day trial)
- Redirected to `/dashboard/personalized`

### 3. Strategic Assessment
- Navigate to `/assessment/streamlined`
- Answer 5 strategic questions:
  - Institution type and size
  - AI journey stage
  - Biggest challenges
  - Top priorities
  - Implementation timeline

### 4. Document Upload
- Navigate to `/assessment/upload-documents`
- Upload up to 5 documents:
  - Strategic Plan (PDF/Word)
  - AI Policy (PDF/Word)
  - Faculty Handbook (PDF/Word)
  - Technology Plan (PDF/Word)
  - Student Handbook (PDF/Word)

### 5. AI Analysis
- Documents are automatically processed
- Text extraction from PDFs/Word docs
- AI analysis using OpenAI GPT-4o
- NIST AI RMF framework gap analysis

### 6. Personalized Dashboard
- View at `/dashboard/personalized`
- See overall AI readiness score
- Review NIST category scores (GOVERN, MAP, MEASURE, MANAGE)
- Access 30/60/90-day roadmaps
- Download gap analysis report

## 🔍 Troubleshooting

### Database Issues

```bash
# Check if tables exist
npm run verify:setup

# Re-run database setup
npm run setup:database

# Check Supabase logs
supabase db logs --tail
```

### Storage Issues

```bash
# Re-run storage setup
npm run setup:storage

# Test storage manually
curl -X GET https://your-project.supabase.co/storage/v1/bucket \
  -H "apikey: your-anon-key"
```

### OpenAI API Issues

```bash
# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer your-api-key"
```

### Common Errors

| Error | Solution |
|-------|----------|
| "Table not found" | Run `npm run setup:database` |
| "Bucket not found" | Run `npm run setup:storage` or create manually |
| "Invalid API key" | Check `.env.local` has correct keys |
| "RLS policy violation" | Ensure user is authenticated |
| "File too large" | Files must be under 10MB |
| "Invalid file type" | Only PDF and Word documents allowed |

## 📊 Platform Features

### New Streamlined Assessment
- 5 strategic questions vs. long survey
- Auto-saves progress
- Personalized to institution type

### Document-Based Analysis
- Upload existing documents
- AI extracts and analyzes content
- No manual data entry required

### NIST AI RMF Framework
- **GOVERN**: Leadership and governance
- **MAP**: Context mapping and categorization
- **MEASURE**: Risk measurement and assessment
- **MANAGE**: Risk management and mitigation

### Personalized Outputs
- Overall maturity score (0-100)
- Category-specific gaps and strengths
- Priority actions and quick wins
- 30/60/90-day implementation roadmaps
- 15-page downloadable report (coming soon)

## 🚢 Deployment

### Vercel Deployment

```bash
# Push to GitHub (auto-deploys)
git push origin main

# Or manual deploy
vercel --prod
```

### Required Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## 📚 Additional Resources

- [Platform Redesign Plan](PLATFORM_REDESIGN_PLAN.md)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

## 💬 Support

For issues or questions:
- Create an issue on GitHub
- Contact: info@northpathstrategies.org
- Check logs: `npm run verify:setup`

---

**Last Updated**: October 2, 2024
**Version**: 2.0.0
**Platform**: AI Readiness Assessment with Document Analysis
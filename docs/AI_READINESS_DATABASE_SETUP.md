# AI Readiness Database Configuration Guide

## Overview

The AI Readiness Assessment system uses a **separate Supabase database** from the organizational realignment tool. This allows for independent scaling, security, and data management.

## Current Status

✅ **Environment Variables Configured**
```bash
AI_READINESS_SUPABASE_URL="https://jocigzsthcpspxfdfxae.supabase.co"
AI_READINESS_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

❌ **Database Tables Not Created Yet**

## Setup Steps

### 1. Access the AI Readiness Supabase Instance

1. Go to https://supabase.com/dashboard
2. Navigate to the AI Readiness project: `jocigzsthcpspxfdfxae.supabase.co`
3. Go to **SQL Editor** in the left sidebar

### 2. Run the Database Schema

1. Open the file `database/ai-readiness-schema.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** to execute the schema

This will create:
- ✅ `ai_readiness_assessments` table (main table)
- ✅ `ai_readiness_teams` table 
- ✅ `ai_readiness_team_members` table
- ✅ `ai_policy_templates` table
- ✅ `ai_readiness_payments` table
- ✅ All necessary indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for automatic timestamp updates
- ✅ Sample policy templates

### 3. Verify Setup

After running the schema, verify the setup by:

1. **Check Tables**: Go to **Table Editor** and confirm all 5 tables exist
2. **Check Policies**: Go to **Authentication > Policies** and verify RLS policies
3. **Test Connection**: Run the test script to create a test assessment

```bash
node test-ai-assessment.js
```

### 4. Test Admin Dashboard Integration

Once the database is set up:

1. Run the test script to create sample assessments
2. Go to `/admin` (login required)
3. Verify that AI readiness assessments appear alongside organizational assessments
4. Check that the overview stats show the breakdown by type

## What This Will Enable

Once properly configured, you'll see in the admin dashboard:

- **Overview Stats**: Total assessments split by type (Organizational: 4, AI Readiness: X)
- **Recent Assessments**: Mixed list with purple badges for AI readiness assessments
- **Assessments Table**: Type column showing both assessment types
- **Analytics**: Breakdown by assessment type in all metrics

## Troubleshooting

### "Table does not exist" error
- **Cause**: Database schema hasn't been run yet
- **Solution**: Follow Step 2 above to create tables

### AI readiness assessments not appearing
- **Cause**: No test data exists
- **Solution**: Run `node test-ai-assessment.js` to create sample data

### Permission errors
- **Cause**: RLS policies not configured
- **Solution**: Ensure the schema script ran completely

## Test Commands

```bash
# Test basic connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(
  process.env.AI_READINESS_SUPABASE_URL,
  process.env.AI_READINESS_SUPABASE_ANON_KEY
);
client.from('ai_readiness_assessments').select('id').limit(1)
  .then(r => console.log('✅ Database accessible:', !r.error))
  .catch(e => console.log('❌ Database error:', e.message));
"

# Test admin API integration
curl -H "Authorization: Bearer admin-token stardynamics1124*" \
  http://localhost:3001/api/admin/assessments/list
```

The admin dashboard is already fully prepared to display AI readiness data - it just needs the database tables to exist!

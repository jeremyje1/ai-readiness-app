# Assessment Submission Fix - October 5, 2025

## Problem
Assessment submission failing with 500 error:
```
Failed to submit assessment: Failed to save assessment
api/assessment/submit:1 Failed to load resource: the server responded with a status of 500
```

## Root Cause
The `streamlined_assessment_responses` table schema doesn't match what the NIST assessment API is trying to save. The table was designed for the old intake form and is missing columns for:
- `responses` (JSONB) - Stores the 20 NIST question answers
- `scores` (JSONB) - Stores calculated scores by category
- `readiness_level` (VARCHAR) - Overall readiness level
- `ai_roadmap` (TEXT) - AI-generated implementation roadmap

Similarly, `gap_analysis_results` table is missing:
- `govern_strengths`, `map_strengths`, `measure_strengths`, `manage_strengths`
- `govern_recommendations`, `map_recommendations`, `measure_recommendations`, `manage_recommendations`
- `priority_actions`

## Solution

### Step 1: Apply Database Migration

**URGENT:** Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Add NIST assessment columns to streamlined_assessment_responses
ALTER TABLE streamlined_assessment_responses 
ADD COLUMN IF NOT EXISTS responses JSONB,
ADD COLUMN IF NOT EXISTS scores JSONB,
ADD COLUMN IF NOT EXISTS readiness_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_roadmap TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_assessment_readiness_level 
ON streamlined_assessment_responses(readiness_level);

CREATE INDEX IF NOT EXISTS idx_assessment_completed 
ON streamlined_assessment_responses(completed_at DESC);

-- Add missing columns to gap_analysis_results
ALTER TABLE gap_analysis_results
ADD COLUMN IF NOT EXISTS govern_strengths JSONB,
ADD COLUMN IF NOT EXISTS govern_recommendations TEXT,
ADD COLUMN IF NOT EXISTS map_strengths JSONB,
ADD COLUMN IF NOT EXISTS map_recommendations TEXT,
ADD COLUMN IF NOT EXISTS measure_strengths JSONB,
ADD COLUMN IF NOT EXISTS measure_recommendations TEXT,
ADD COLUMN IF NOT EXISTS manage_strengths JSONB,
ADD COLUMN IF NOT EXISTS manage_recommendations TEXT,
ADD COLUMN IF NOT EXISTS priority_actions JSONB;

-- Add unique constraint on user_id for gap_analysis_results
CREATE UNIQUE INDEX IF NOT EXISTS idx_gap_analysis_user_id_unique 
ON gap_analysis_results(user_id);
```

### Step 2: Verify Migration

Run this query to verify the columns were added:

```sql
-- Check streamlined_assessment_responses
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'streamlined_assessment_responses' 
AND column_name IN ('responses', 'scores', 'readiness_level', 'ai_roadmap');

-- Check gap_analysis_results
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gap_analysis_results' 
AND column_name IN ('govern_strengths', 'priority_actions');
```

Should return:
- streamlined_assessment_responses: 4 rows (responses, scores, readiness_level, ai_roadmap)
- gap_analysis_results: 9 rows (all the new columns)

### Step 3: Test Assessment

1. Go to https://aiblueprint.educationaiblueprint.com/assessment
2. Complete the 20-question NIST assessment
3. Click "Complete Assessment"
4. Should see success message and redirect to dashboard

## Files Created

1. **supabase/migrations/20250105_add_nist_assessment_columns.sql**
   - Complete migration with all ALTER TABLE statements
   - Includes indexes and comments

2. **FIX_ASSESSMENT_SCHEMA.sql**
   - Quick reference SQL to copy/paste into Supabase

3. **apply-assessment-migration.js**
   - Node.js script to apply migration (doesn't work due to RPC limitation)
   - Use manual SQL Editor approach instead

## Technical Details

### API Endpoint: `/app/api/assessment/submit/route.ts`

Expects to insert:
```typescript
{
  user_id: UUID,
  responses: { 0: 2, 1: 1, 2: 3, ... }, // Question answers (0-indexed)
  scores: {
    GOVERN: { score: 10, maxScore: 15, percentage: 67 },
    MAP: { score: 8, maxScore: 15, percentage: 53 },
    MEASURE: { score: 12, maxScore: 15, percentage: 80 },
    MANAGE: { score: 9, maxScore: 15, percentage: 60 },
    OVERALL: { score: 39, maxScore: 60, percentage: 65 }
  },
  readiness_level: 'Developing',
  ai_roadmap: '# AI Readiness Roadmap\n...',
  completed_at: '2025-10-05T20:15:00Z'
}
```

### Old Schema (WRONG)
```sql
CREATE TABLE streamlined_assessment_responses (
  id UUID PRIMARY KEY,
  user_id UUID,
  institution_type VARCHAR(50),
  institution_size VARCHAR(50),
  -- ... demographic fields only
);
```

### New Schema (CORRECT)
```sql
CREATE TABLE streamlined_assessment_responses (
  id UUID PRIMARY KEY,
  user_id UUID,
  -- Old fields remain...
  -- NEW FIELDS:
  responses JSONB,
  scores JSONB,
  readiness_level VARCHAR(50),
  ai_roadmap TEXT,
  completed_at TIMESTAMPTZ
);
```

## Next Steps After Migration

1. ✅ Apply SQL migration in Supabase Dashboard
2. ✅ Verify columns exist with verification queries
3. 🧪 Test assessment submission flow
4. 📊 Check dashboard displays scores correctly
5. 🎯 Verify gap analysis data is created

## Related Files

- `/app/api/assessment/submit/route.ts` - Assessment submission API
- `/app/assessment/page.tsx` - 20-question NIST assessment UI
- `/app/dashboard/page.tsx` - Dashboard that displays results
- `/supabase/migrations/applied_backup/20251002100318_platform_redesign_schema.sql` - Original schema

## Status

- ❌ **Assessment submission currently failing** (500 error)
- ⏳ **Waiting for database migration to be applied**
- 📋 **Migration SQL ready in FIX_ASSESSMENT_SCHEMA.sql**
- 🎯 **Once migration applied, assessment will work immediately**

## Timeline

- **Discovered:** October 5, 2025 8:30 PM CST
- **Migration Created:** October 5, 2025 8:35 PM CST
- **Status:** Waiting for manual SQL execution in Supabase Dashboard
- **ETA to Fix:** 2 minutes after SQL is run

---

**Action Required:** Please run the SQL in `FIX_ASSESSMENT_SCHEMA.sql` in your Supabase SQL Editor now.

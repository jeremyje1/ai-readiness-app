-- ============================================
-- NIST Assessment Schema Fix
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

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

-- Verify the changes
SELECT 
    'streamlined_assessment_responses' as table_name,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'streamlined_assessment_responses' 
AND column_name IN ('responses', 'scores', 'readiness_level', 'ai_roadmap')
ORDER BY column_name;

SELECT 
    'gap_analysis_results' as table_name,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'gap_analysis_results' 
AND column_name IN ('govern_strengths', 'govern_recommendations', 'priority_actions')
ORDER BY column_name;

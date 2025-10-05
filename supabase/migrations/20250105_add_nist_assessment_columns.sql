-- Add NIST assessment column-- Add missing columns to gap_analysis_results
-- Note: Supabase creates these as TEXT[] (ARRAY) by default, not TEXT
ALTER TABLE gap_analysis_results
ADD COLUMN IF NOT EXISTS govern_strengths TEXT[],
ADD COLUMN IF NOT EXISTS govern_recommendations TEXT[],
ADD COLUMN IF NOT EXISTS map_strengths TEXT[],
ADD COLUMN IF NOT EXISTS map_recommendations TEXT[],
ADD COLUMN IF NOT EXISTS measure_strengths TEXT[],
ADD COLUMN IF NOT EXISTS measure_recommendations TEXT[],
ADD COLUMN IF NOT EXISTS manage_strengths TEXT[],
ADD COLUMN IF NOT EXISTS manage_recommendations TEXT[],
ADD COLUMN IF NOT EXISTS priority_actions TEXT[];lined_assessment_responses table
-- This allows storing the 20-question NIST assessment data

ALTER TABLE streamlined_assessment_responses 
ADD COLUMN IF NOT EXISTS responses JSONB,
ADD COLUMN IF NOT EXISTS scores JSONB,
ADD COLUMN IF NOT EXISTS readiness_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS ai_roadmap TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_assessment_readiness_level 
ON streamlined_assessment_responses(readiness_level);

CREATE INDEX IF NOT EXISTS idx_assessment_completed 
ON streamlined_assessment_responses(completed_at DESC);

-- Comment the new columns
COMMENT ON COLUMN streamlined_assessment_responses.responses IS 
'JSONB object containing question_id: answer_value pairs for NIST assessment';

COMMENT ON COLUMN streamlined_assessment_responses.scores IS 
'JSONB object containing calculated scores by category (GOVERN, MAP, MEASURE, MANAGE, OVERALL)';

COMMENT ON COLUMN streamlined_assessment_responses.readiness_level IS 
'Overall readiness level: Beginning, Emerging, Developing, or Advanced';

COMMENT ON COLUMN streamlined_assessment_responses.ai_roadmap IS 
'AI-generated 30/60/90 day implementation roadmap based on assessment results';

-- Add missing columns to gap_analysis_results table
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
-- This allows upsert operations to work correctly
CREATE UNIQUE INDEX IF NOT EXISTS idx_gap_analysis_user_id_unique 
ON gap_analysis_results(user_id);

-- Comment the new columns
COMMENT ON COLUMN gap_analysis_results.govern_strengths IS 
'TEXT[] array of strengths identified in the GOVERN category';

COMMENT ON COLUMN gap_analysis_results.govern_recommendations IS 
'TEXT[] array of recommendations for improving GOVERN category scores';

COMMENT ON COLUMN gap_analysis_results.map_strengths IS 
'TEXT[] array of strengths identified in the MAP category';

COMMENT ON COLUMN gap_analysis_results.map_recommendations IS 
'TEXT[] array of recommendations for improving MAP category scores';

COMMENT ON COLUMN gap_analysis_results.measure_strengths IS 
'TEXT[] array of strengths identified in the MEASURE category';

COMMENT ON COLUMN gap_analysis_results.measure_recommendations IS 
'TEXT[] array of recommendations for improving MEASURE category scores';

COMMENT ON COLUMN gap_analysis_results.manage_strengths IS 
'TEXT[] array of strengths identified in the MANAGE category';

COMMENT ON COLUMN gap_analysis_results.manage_recommendations IS 
'TEXT[] array of recommendations for improving MANAGE category scores';

COMMENT ON COLUMN gap_analysis_results.priority_actions IS 
'TEXT[] array of priority actions to take immediately';

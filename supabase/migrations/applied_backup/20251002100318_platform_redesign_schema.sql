-- Platform Redesign Schema
-- Creates tables for new streamlined assessment, document uploads, and personalized dashboard

-- Table: uploaded_documents
-- Stores user-uploaded documents for AI analysis
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'strategic_plan', 'ai_policy', 'faculty_handbook', 'tech_plan', 'student_handbook'
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- S3 or storage path
  file_size INTEGER,
  mime_type VARCHAR(100),
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
  extracted_text TEXT, -- Full text extracted from document
  ai_analysis JSONB, -- AI-generated analysis of document
  gap_analysis JSONB, -- Specific gaps identified
  metadata JSONB, -- Additional document metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_user_id ON uploaded_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_status ON uploaded_documents(processing_status);

-- Table: streamlined_assessment_responses
-- Stores responses to the new 3-5 strategic questions
CREATE TABLE IF NOT EXISTS streamlined_assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  institution_type VARCHAR(50), -- 'university', 'community_college', 'trade_school', 'k12_district'
  institution_size VARCHAR(50), -- 'small', 'medium', 'large', 'very_large'
  institution_state VARCHAR(50),
  ai_journey_stage VARCHAR(50), -- 'just_starting', 'piloting', 'implementing', 'optimizing'
  biggest_challenge TEXT,
  top_priorities JSONB, -- Array of selected priorities
  implementation_timeline VARCHAR(50), -- 'immediate', 'planning', 'long_term'
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_role VARCHAR(255),
  preferred_consultation_time VARCHAR(100),
  special_considerations TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_assessment_responses_user_id ON streamlined_assessment_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_institution_type ON streamlined_assessment_responses(institution_type);

-- Table: gap_analysis_results
-- Stores NIST framework gap analysis results
CREATE TABLE IF NOT EXISTS gap_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_date TIMESTAMPTZ DEFAULT NOW(),
  overall_score INTEGER, -- 0-100 score
  maturity_level VARCHAR(50), -- 'nascent', 'emerging', 'developing', 'mature', 'leading'

  -- NIST AI RMF Framework Categories
  govern_score INTEGER, -- Score for GOVERN category
  govern_gaps JSONB, -- Specific gaps in governance

  map_score INTEGER, -- Score for MAP category
  map_gaps JSONB, -- Specific gaps in mapping

  measure_score INTEGER, -- Score for MEASURE category
  measure_gaps JSONB, -- Specific gaps in measurement

  manage_score INTEGER, -- Score for MANAGE category
  manage_gaps JSONB, -- Specific gaps in management

  -- Institutional Gaps
  policy_gaps JSONB,
  training_gaps JSONB,
  compliance_gaps JSONB,
  technology_gaps JSONB,

  -- Recommendations
  quick_wins JSONB, -- Immediate actions (30 days)
  strategic_initiatives JSONB, -- Medium-term actions (60 days)
  transformation_goals JSONB, -- Long-term actions (90 days)

  priority_score INTEGER, -- Overall priority/urgency
  recommendations JSONB, -- Detailed recommendations

  -- Report Generation
  pdf_report_path TEXT, -- Path to generated PDF report
  report_generated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_gap_analysis_user_id ON gap_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_gap_analysis_date ON gap_analysis_results(analysis_date DESC);

-- Table: implementation_roadmaps
-- Stores personalized implementation roadmaps
CREATE TABLE IF NOT EXISTS implementation_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_type VARCHAR(50) NOT NULL, -- '30_day', '60_day', '90_day', 'full'

  -- Roadmap Content
  phase_name VARCHAR(255),
  goals JSONB, -- Array of goals for this phase
  action_items JSONB, -- Detailed action items with deadlines
  milestones JSONB, -- Key milestones
  resources_needed JSONB, -- Resources required
  success_metrics JSONB, -- How to measure success

  -- Status Tracking
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  progress_percentage INTEGER DEFAULT 0,
  completed_items JSONB, -- Array of completed action item IDs

  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON implementation_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_type ON implementation_roadmaps(roadmap_type);

-- Table: user_activity_log
-- Tracks user interactions for analytics and persistence
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL, -- 'assessment_started', 'document_uploaded', 'roadmap_viewed', etc
  activity_data JSONB, -- Details about the activity
  page_url TEXT,
  session_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON user_activity_log(created_at DESC);

-- Update user_profiles table with new fields (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='institution_data') THEN
    ALTER TABLE user_profiles ADD COLUMN institution_data JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='assessment_responses') THEN
    ALTER TABLE user_profiles ADD COLUMN assessment_responses JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='priorities') THEN
    ALTER TABLE user_profiles ADD COLUMN priorities JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='maturity_level') THEN
    ALTER TABLE user_profiles ADD COLUMN maturity_level VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='gap_analysis_complete') THEN
    ALTER TABLE user_profiles ADD COLUMN gap_analysis_complete BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='roadmap_generated') THEN
    ALTER TABLE user_profiles ADD COLUMN roadmap_generated BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='onboarding_complete') THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_complete BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Row Level Security (RLS) Policies

-- uploaded_documents policies
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON uploaded_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON uploaded_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON uploaded_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON uploaded_documents
  FOR DELETE USING (auth.uid() = user_id);

-- streamlined_assessment_responses policies
ALTER TABLE streamlined_assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessment" ON streamlined_assessment_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessment" ON streamlined_assessment_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessment" ON streamlined_assessment_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- gap_analysis_results policies
ALTER TABLE gap_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gap analysis" ON gap_analysis_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gap analysis" ON gap_analysis_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gap analysis" ON gap_analysis_results
  FOR UPDATE USING (auth.uid() = user_id);

-- implementation_roadmaps policies
ALTER TABLE implementation_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roadmaps" ON implementation_roadmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps" ON implementation_roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmaps" ON implementation_roadmaps
  FOR UPDATE USING (auth.uid() = user_id);

-- user_activity_log policies
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_uploaded_documents_updated_at
  BEFORE UPDATE ON uploaded_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_responses_updated_at
  BEFORE UPDATE ON streamlined_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gap_analysis_updated_at
  BEFORE UPDATE ON gap_analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
  BEFORE UPDATE ON implementation_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

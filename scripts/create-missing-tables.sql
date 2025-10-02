-- Create missing tables for the new platform redesign
-- Run this in Supabase SQL Editor

-- 1. Streamlined Assessment Responses
CREATE TABLE IF NOT EXISTS streamlined_assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Institution info
    institution_type TEXT,
    institution_size TEXT,
    institution_state TEXT,

    -- AI Journey
    ai_journey_stage TEXT,
    biggest_challenge TEXT,

    -- Priorities
    top_priorities TEXT[],
    implementation_timeline TEXT,

    -- Contact info
    contact_name TEXT,
    contact_email TEXT,
    contact_role TEXT,
    preferred_consultation_time TEXT,
    special_considerations TEXT,

    -- Metadata
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Uploaded Documents (for document upload feature)
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    file_url TEXT,
    mime_type TEXT,
    processing_status TEXT DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    analysis_result JSONB,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Gap Analysis Results
CREATE TABLE IF NOT EXISTS gap_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Overall scores
    overall_score DECIMAL(5,2),
    maturity_level TEXT,

    -- GOVERN scores and analysis
    govern_score DECIMAL(5,2),
    govern_gaps TEXT[],
    govern_strengths TEXT[],
    govern_recommendations TEXT[],

    -- MAP scores and analysis
    map_score DECIMAL(5,2),
    map_gaps TEXT[],
    map_strengths TEXT[],
    map_recommendations TEXT[],

    -- MEASURE scores and analysis
    measure_score DECIMAL(5,2),
    measure_gaps TEXT[],
    measure_strengths TEXT[],
    measure_recommendations TEXT[],

    -- MANAGE scores and analysis
    manage_score DECIMAL(5,2),
    manage_gaps TEXT[],
    manage_strengths TEXT[],
    manage_recommendations TEXT[],

    -- Priority actions
    priority_actions TEXT[],
    quick_wins TEXT[],

    -- Metadata
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Implementation Roadmaps
CREATE TABLE IF NOT EXISTS implementation_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_type TEXT, -- '30_day', '60_day', '90_day', 'annual'

    -- Roadmap content
    goals TEXT[],
    action_items TEXT[],
    milestones TEXT[],
    success_metrics TEXT[],

    -- Timeline
    start_date DATE,
    end_date DATE,

    -- Status tracking
    status TEXT DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Activity Log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streamlined_assessment_user_id ON streamlined_assessment_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_user_id ON uploaded_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_gap_analysis_user_id ON gap_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON implementation_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON user_activity_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE streamlined_assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only see their own data)
CREATE POLICY "Users can view own assessment responses" ON streamlined_assessment_responses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents" ON uploaded_documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own gap analysis" ON gap_analysis_results
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own roadmaps" ON implementation_roadmaps
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity" ON user_activity_log
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON streamlined_assessment_responses TO authenticated;
GRANT ALL ON uploaded_documents TO authenticated;
GRANT ALL ON gap_analysis_results TO authenticated;
GRANT ALL ON implementation_roadmaps TO authenticated;
GRANT ALL ON user_activity_log TO authenticated;

-- Grant permissions to service role (for backend operations)
GRANT ALL ON streamlined_assessment_responses TO service_role;
GRANT ALL ON uploaded_documents TO service_role;
GRANT ALL ON gap_analysis_results TO service_role;
GRANT ALL ON implementation_roadmaps TO service_role;
GRANT ALL ON user_activity_log TO service_role;
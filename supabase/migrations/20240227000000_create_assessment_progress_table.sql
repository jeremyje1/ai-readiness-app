-- Create assessment_progress table for autosave functionality
-- This table stores assessment progress for resume functionality

CREATE TABLE IF NOT EXISTS assessment_progress (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    assessment_id TEXT NOT NULL,
    audience TEXT NOT NULL CHECK (audience IN ('k12', 'highered')),
    user_id TEXT,
    current_section TEXT NOT NULL,
    current_question TEXT NOT NULL,
    responses JSONB DEFAULT '{}',
    completed_sections TEXT[] DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_saved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    is_complete BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_progress_session_id ON assessment_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_progress_user_id ON assessment_progress(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assessment_progress_audience ON assessment_progress(audience);
CREATE INDEX IF NOT EXISTS idx_assessment_progress_assessment_id ON assessment_progress(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_progress_updated_at ON assessment_progress(updated_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assessment_progress_updated_at 
    BEFORE UPDATE ON assessment_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for security
ALTER TABLE assessment_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own progress records
CREATE POLICY "Users can access their own assessment progress" ON assessment_progress
    FOR ALL USING (
        user_id IS NULL OR user_id = auth.uid()::text
    );

-- Policy: Anonymous users can access records with no user_id (session-based)
CREATE POLICY "Anonymous users can access session-based progress" ON assessment_progress
    FOR ALL USING (
        user_id IS NULL
    );

-- Add comments for documentation
COMMENT ON TABLE assessment_progress IS 'Stores assessment progress for autosave and resume functionality';
COMMENT ON COLUMN assessment_progress.session_id IS 'Unique session identifier for the assessment attempt';
COMMENT ON COLUMN assessment_progress.assessment_id IS 'ID of the assessment bank being taken';
COMMENT ON COLUMN assessment_progress.audience IS 'Audience type (k12 or highered)';
COMMENT ON COLUMN assessment_progress.user_id IS 'User ID if authenticated, null for anonymous sessions';
COMMENT ON COLUMN assessment_progress.responses IS 'JSON object of question_id -> answer pairs';
COMMENT ON COLUMN assessment_progress.completed_sections IS 'Array of completed section IDs';
COMMENT ON COLUMN assessment_progress.progress_percent IS 'Progress percentage (0-100)';
COMMENT ON COLUMN assessment_progress.metadata IS 'Additional metadata like user agent, referrer, etc.';
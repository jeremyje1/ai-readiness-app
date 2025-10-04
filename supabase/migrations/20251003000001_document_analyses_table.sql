-- Create document_analyses table to store AI analysis results
CREATE TABLE IF NOT EXISTS public.document_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  document_type TEXT,
  key_themes TEXT[] DEFAULT '{}',
  ai_readiness_indicators TEXT[] DEFAULT '{}',
  alignment_opportunities TEXT[] DEFAULT '{}',
  gaps TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  analysis_data JSONB,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_document_analyses_user_id ON public.document_analyses(user_id);
CREATE INDEX idx_document_analyses_analyzed_at ON public.document_analyses(analyzed_at DESC);

-- Enable RLS
ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own document analyses
CREATE POLICY "Users can view own document analyses" ON public.document_analyses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own document analyses
CREATE POLICY "Users can insert own document analyses" ON public.document_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own document analyses
CREATE POLICY "Users can update own document analyses" ON public.document_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own document analyses
CREATE POLICY "Users can delete own document analyses" ON public.document_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.document_analyses IS 'Stores AI-powered document analysis results for paid subscribers';
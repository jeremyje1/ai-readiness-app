-- Supabase Database Setup for Organizational Realignment App
-- Run this in your Supabase SQL Editor to set up required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create institutions table (if not exists)
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    headcount INTEGER,
    budget DECIMAL(15,2),
    depth_mode TEXT,
    owner_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    org_type TEXT
);

-- Create survey_responses table for storing survey answers
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answer_numeric DECIMAL,
    answer_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS survey_inst_idx ON public.survey_responses(institution_id);
CREATE INDEX IF NOT EXISTS survey_q_idx ON public.survey_responses(question_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institutions
CREATE POLICY "Users can view their own institutions" ON public.institutions
    FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own institutions" ON public.institutions
    FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own institutions" ON public.institutions
    FOR UPDATE USING (auth.uid() = owner_user_id);

-- RLS Policies for survey_responses
CREATE POLICY "Users can view survey responses for their institutions" ON public.survey_responses
    FOR SELECT USING (
        institution_id IN (
            SELECT id FROM public.institutions WHERE owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create survey responses for their institutions" ON public.survey_responses
    FOR INSERT WITH CHECK (
        institution_id IN (
            SELECT id FROM public.institutions WHERE owner_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update survey responses for their institutions" ON public.survey_responses
    FOR UPDATE USING (
        institution_id IN (
            SELECT id FROM public.institutions WHERE owner_user_id = auth.uid()
        )
    );

-- Create a function to automatically create an institution for new users
CREATE OR REPLACE FUNCTION public.create_user_institution()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.institutions (owner_user_id, name, slug, org_type, headcount, budget, depth_mode)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'inst-' || NEW.id::text,
        'community-college',
        1000,
        5000000.00,
        'basic'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create institution for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_institution();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.institutions TO authenticated;
GRANT ALL ON public.survey_responses TO authenticated;

-- Insert sample data (optional)
-- INSERT INTO public.institutions (owner_user_id, name, slug, org_type, headcount, budget, depth_mode)
-- VALUES (
--     'sample-user-id',
--     'Sample University',
--     'sample-university',
--     'public-university',
--     15000,
--     50000000.00,
--     'comprehensive'
-- ) ON CONFLICT (slug) DO NOTHING;

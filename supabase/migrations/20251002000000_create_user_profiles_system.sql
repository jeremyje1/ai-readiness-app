-- User Profile System for AI Blueprint Platform
-- Created: 2025-10-02
-- Purpose: Store and persist user institutional data across sessions

-- Create user_profiles table to store comprehensive user and institutional information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Personal Information
    full_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    job_title TEXT,
    department TEXT,

    -- Institutional Information
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    institution_name TEXT,
    institution_type TEXT CHECK (institution_type IN ('K12', 'HigherEd', 'District', 'University', 'Community College', 'Trade School', 'default')),
    institution_size TEXT CHECK (institution_size IN ('Small', 'Medium', 'Large', 'Extra Large')),
    student_count INTEGER,
    faculty_count INTEGER,
    staff_count INTEGER,
    annual_budget DECIMAL(15,2),

    -- Location Information
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'US',
    timezone TEXT DEFAULT 'America/New_York',

    -- Assessment Preferences
    preferred_mode TEXT CHECK (preferred_mode IN ('quick', 'comprehensive', 'full')) DEFAULT 'quick',
    assessment_context JSONB DEFAULT '{}',

    -- Subscription & Onboarding
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    onboarding_data JSONB DEFAULT '{}',
    subscription_tier TEXT,
    subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'trial', 'expired')) DEFAULT 'inactive',
    trial_ends_at TIMESTAMPTZ,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,

    -- Additional metadata
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_institution_id ON public.user_profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_institution_type ON public.user_profiles(institution_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON public.user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
CREATE POLICY "Users can create their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create user profile for new users
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        institution_type,
        onboarding_completed
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'default',
        false
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user profile
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON public.user_profiles;
CREATE TRIGGER update_user_profiles_timestamp
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_user_profile_timestamp();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- Create view for user profile with institution data
CREATE OR REPLACE VIEW public.user_profile_with_institution AS
SELECT
    up.*,
    i.name as institution_full_name,
    i.slug as institution_slug,
    i.org_type as institution_org_type,
    i.headcount as institution_headcount,
    i.budget as institution_budget
FROM public.user_profiles up
LEFT JOIN public.institutions i ON up.institution_id = i.id;

-- Grant access to the view
GRANT SELECT ON public.user_profile_with_institution TO authenticated;

-- Comment on table and columns for documentation
COMMENT ON TABLE public.user_profiles IS 'Stores comprehensive user and institutional profile information that persists across sessions';
COMMENT ON COLUMN public.user_profiles.onboarding_data IS 'JSONB field storing onboarding responses that previously lived in localStorage';
COMMENT ON COLUMN public.user_profiles.assessment_context IS 'JSONB field storing assessment-specific context and preferences';
COMMENT ON COLUMN public.user_profiles.preferences IS 'JSONB field for user UI/UX preferences';
COMMENT ON COLUMN public.user_profiles.metadata IS 'JSONB field for extensible custom data';

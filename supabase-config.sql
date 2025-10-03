-- AI Blueprint Platform - Supabase SQL Configuration
-- Run these commands in your Supabase SQL Editor
-- Project: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae

-- ============================================
-- 1. Enable Row Level Security
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Create Policies for user_profiles
-- ============================================

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow service role to insert profiles (for signup)
CREATE POLICY "Service role can insert profiles"
ON user_profiles
FOR INSERT
WITH CHECK (true);

-- ============================================
-- 3. Create Function for Auto-Profile Creation
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    name,
    organization,
    title,
    phone,
    institution_type,
    tier,
    subscription_status,
    trial_ends_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization', ''),
    COALESCE(NEW.raw_user_meta_data->>'title', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'institution_type', 'K12'),
    COALESCE(NEW.raw_user_meta_data->>'tier', 'ai-blueprint-edu'),
    COALESCE(NEW.raw_user_meta_data->>'subscription_status', 'trial'),
    (NOW() + INTERVAL '7 days')::timestamptz,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Create Trigger for Auto-Profile Creation
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. Ensure user_profiles table exists
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  organization TEXT,
  title TEXT,
  phone TEXT,
  institution_type TEXT DEFAULT 'K12',
  tier TEXT DEFAULT 'ai-blueprint-edu',
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

-- ============================================
-- 6. Create Index for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_ends_at ON user_profiles(trial_ends_at);

-- ============================================
-- 7. Grant Permissions
-- ============================================

GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- ============================================
-- CONFIGURATION NOTES
-- ============================================

-- After running this SQL, configure in Supabase Dashboard:
-- 
-- 1. Auth Settings (Authentication -> Settings):
--    - Site URL: https://aiblueprint.educationaiblueprint.com
--    - Redirect URLs:
--      • https://aiblueprint.educationaiblueprint.com/auth/callback
--      • https://aiblueprint.educationaiblueprint.com/welcome
--      • https://aiblueprint.educationaiblueprint.com/dashboard/personalized
--      • http://localhost:3000/** (for development)
-- 
-- 2. Email Templates (Authentication -> Email Templates):
--    - Disable "Confirm signup" email (since we auto-confirm)
--    - Customize "Magic Link" email if using
-- 
-- 3. Auth Providers (Authentication -> Providers):
--    - Enable Email provider
--    - Confirm email: OFF (auto-confirm for trials)
--    - Secure email change: ON
-- 
-- 4. Rate Limiting (Authentication -> Rate Limits):
--    - Adjust as needed for production traffic
-- AI Blueprint EDU - Supabase Configuration Update
-- Date: October 3, 2025
-- New Domain: aiblueprint.educationaiblueprint.com

-- This script should be run in the Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/sql/new

-- ============================================
-- AUTHENTICATION CONFIGURATION
-- ============================================

-- Note: The following settings need to be configured in the Supabase Dashboard
-- as they cannot be set via SQL:

-- 1. Site URL (Authentication → URL Configuration):
--    https://aiblueprint.educationaiblueprint.com

-- 2. Redirect URLs (Authentication → URL Configuration):
--    Add these URLs:
--    - https://aiblueprint.educationaiblueprint.com/auth/callback
--    - https://aiblueprint.educationaiblueprint.com/welcome
--    - https://aiblueprint.educationaiblueprint.com/dashboard/personalized

-- 3. CRITICAL - Email Confirmation (Authentication → Providers → Email):
--    DISABLE "Confirm email" checkbox
--    This enables immediate 7-day trial access without email verification!

-- ============================================
-- DATABASE VERIFICATION
-- ============================================

-- Verify user_profiles table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
) as user_profiles_exists;

-- Verify RLS policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Check for any users without profiles (should auto-create via trigger)
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE WHEN up.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- ============================================
-- MANUAL CONFIGURATION CHECKLIST
-- ============================================

/*
□ Site URL updated to: https://aiblueprint.educationaiblueprint.com
□ Redirect URLs added (all 3 URLs)
□ Email confirmation DISABLED (most critical!)
□ SMTP settings verified (if using custom email)
□ Rate limiting reviewed (if needed)

Dashboard URLs:
- URL Configuration: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/auth/url-configuration
- Email Provider: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/auth/providers
- Templates: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/auth/templates
*/

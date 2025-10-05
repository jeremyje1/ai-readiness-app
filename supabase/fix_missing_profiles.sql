-- Fix for users without profiles
-- Run this in Supabase SQL Editor to create missing profiles

-- Create profiles for any auth users that don't have profiles yet
INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    institution_type,
    subscription_tier,
    subscription_status,
    trial_ends_at,
    onboarding_completed
)
SELECT 
    au.id as user_id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'full_name',
        split_part(au.email, '@', 1)
    ) as full_name,
    COALESCE(au.raw_user_meta_data->>'institution_type', 'K12') as institution_type,
    'trial' as subscription_tier,
    'trialing' as subscription_status,
    (NOW() + INTERVAL '7 days')::timestamptz as trial_ends_at,
    false as onboarding_completed
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.id IS NULL  -- Only insert for users without profiles
AND au.deleted_at IS NULL;  -- Don't create profiles for deleted users

-- Verify profiles were created
SELECT 
    au.email,
    up.full_name,
    up.institution_type,
    up.trial_ends_at,
    up.created_at
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY up.created_at DESC
LIMIT 10;

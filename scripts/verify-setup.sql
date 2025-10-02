-- Verify that all required tables exist and are empty
-- Run this in Supabase SQL Editor

SELECT
    'Table Status Report' as report_title,
    NOW() as report_time;

-- Check new tables exist
SELECT
    table_name,
    CASE
        WHEN table_name IN (
            'streamlined_assessment_responses',
            'uploaded_documents',
            'gap_analysis_results',
            'implementation_roadmaps',
            'user_activity_log'
        ) THEN '✅ Created'
        ELSE '📦 Existing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'streamlined_assessment_responses',
    'uploaded_documents',
    'gap_analysis_results',
    'implementation_roadmaps',
    'user_activity_log',
    'auth_password_setup_tokens',
    'user_payments',
    'user_profiles'
)
ORDER BY table_name;

-- Check if users are cleared
SELECT
    'User Count' as metric,
    COUNT(*) as value
FROM auth.users;

-- Check if password tokens are cleared
SELECT
    'Password Token Count' as metric,
    COUNT(*) as value
FROM auth_password_setup_tokens;

-- Check if new tables are empty and ready
SELECT
    'streamlined_assessment_responses' as table_name,
    COUNT(*) as row_count
FROM streamlined_assessment_responses
UNION ALL
SELECT
    'uploaded_documents',
    COUNT(*)
FROM uploaded_documents
UNION ALL
SELECT
    'gap_analysis_results',
    COUNT(*)
FROM gap_analysis_results
UNION ALL
SELECT
    'implementation_roadmaps',
    COUNT(*)
FROM implementation_roadmaps
UNION ALL
SELECT
    'user_activity_log',
    COUNT(*)
FROM user_activity_log;

-- Check RLS is enabled
SELECT
    tablename,
    CASE
        WHEN rowsecurity = true THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'streamlined_assessment_responses',
    'uploaded_documents',
    'gap_analysis_results',
    'implementation_roadmaps',
    'user_activity_log'
);
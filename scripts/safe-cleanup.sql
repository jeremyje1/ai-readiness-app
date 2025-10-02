-- Safe cleanup script that handles tables without id columns
-- Run this in Supabase SQL Editor

-- Step 1: Delete from tables that depend on institutions (check column first)
DO $$
BEGIN
    -- institution_memberships
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_memberships' AND column_name = 'id') THEN
        DELETE FROM institution_memberships;
    ELSE
        DELETE FROM institution_memberships WHERE true;
    END IF;

    -- institutions
    DELETE FROM institutions WHERE owner_user_id IS NOT NULL;
END $$;

-- Step 2: Delete from teams tables
DO $$
BEGIN
    DELETE FROM team_members WHERE true;
    DELETE FROM ai_readiness_team_members WHERE true;
    DELETE FROM teams WHERE true;
    DELETE FROM ai_readiness_teams WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some team tables may not exist: %', SQLERRM;
END $$;

-- Step 3: Delete vendor-related data (these may not have id columns)
DO $$
BEGIN
    DELETE FROM vendor_assessments WHERE true;
    DELETE FROM vendor_audit_logs WHERE true;
    DELETE FROM vendor_compliance_report WHERE true; -- This one doesn't have id
    DELETE FROM vendor_control_dependencies WHERE true;
    DELETE FROM vendor_data_flows WHERE true;
    DELETE FROM vendor_decision_briefs WHERE true;
    DELETE FROM vendor_intake_forms WHERE true;
    DELETE FROM vendor_intakes WHERE true;
    DELETE FROM vendor_mitigations WHERE true;
    DELETE FROM vendor_profiles WHERE true;
    DELETE FROM vendor_tools WHERE true;
    DELETE FROM vendor_vetting_audit WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with vendor tables: %', SQLERRM;
END $$;

-- Step 4: Delete approval-related data
DO $$
BEGIN
    DELETE FROM approval_approvers WHERE true;
    DELETE FROM approval_audit_logs WHERE true;
    DELETE FROM approval_comments WHERE true;
    DELETE FROM approval_events WHERE true;
    DELETE FROM approval_notifications WHERE true;
    DELETE FROM approvals WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with approval tables: %', SQLERRM;
END $$;

-- Step 5: Delete assessment data
DO $$
BEGIN
    DELETE FROM assessment_metrics WHERE true;
    DELETE FROM assessment_progress WHERE true;
    DELETE FROM assessments WHERE true;
    DELETE FROM ai_readiness_assessments WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with assessment tables: %', SQLERRM;
END $$;

-- Step 6: Delete compliance and policy data
DO $$
BEGIN
    DELETE FROM compliance_evidence WHERE true;
    DELETE FROM compliance_findings WHERE true;
    DELETE FROM compliance_tracking WHERE true;
    DELETE FROM risk_assessments WHERE true;
    DELETE FROM policy_control_mappings WHERE true;
    DELETE FROM policy_redline_packs WHERE true;
    DELETE FROM policy_update_job_logs WHERE true;
    DELETE FROM policy_update_notifications WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with compliance tables: %', SQLERRM;
END $$;

-- Step 7: Delete framework data
DO $$
BEGIN
    DELETE FROM framework_changes WHERE true;
    DELETE FROM framework_controls WHERE true;
    DELETE FROM framework_metadata WHERE true;
    DELETE FROM framework_scores WHERE true;
    DELETE FROM framework_monitoring_config WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with framework tables: %', SQLERRM;
END $$;

-- Step 8: Delete document data
DO $$
BEGIN
    DELETE FROM decision_briefs WHERE true;
    DELETE FROM document_sections WHERE true;
    DELETE FROM documents WHERE true;
    DELETE FROM artifacts WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with document tables: %', SQLERRM;
END $$;

-- Step 9: Delete analytics and events
DO $$
BEGIN
    DELETE FROM analytics_events WHERE true;
    DELETE FROM usage_analytics WHERE true;
    DELETE FROM community_event_registrations WHERE true;
    DELETE FROM community_join_requests WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with analytics tables: %', SQLERRM;
END $$;

-- Step 10: Delete algorithm data
DO $$
BEGIN
    DELETE FROM enterprise_algorithm_changelog WHERE true;
    DELETE FROM enterprise_algorithm_results WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with algorithm tables: %', SQLERRM;
END $$;

-- Step 11: Delete PII detections
DO $$
BEGIN
    DELETE FROM pii_detections WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with PII tables: %', SQLERRM;
END $$;

-- Step 12: Delete user-specific tables
DO $$
BEGIN
    DELETE FROM auth_password_setup_tokens WHERE true;
    DELETE FROM user_payments WHERE true;
    DELETE FROM ai_readiness_payments WHERE true;
    DELETE FROM user_profiles WHERE true;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with user tables: %', SQLERRM;
END $$;

-- Step 13: Finally, delete all users from auth.users
DELETE FROM auth.users WHERE id IS NOT NULL;

-- Verify cleanup
SELECT
    'Cleanup Complete!' as status,
    (SELECT COUNT(*) FROM auth.users) as remaining_users;
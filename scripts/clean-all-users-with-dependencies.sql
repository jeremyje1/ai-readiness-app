-- Complete cleanup script that handles all foreign key dependencies
-- Run this in Supabase SQL Editor

-- Step 1: Delete from tables that depend on institutions
DELETE FROM institution_memberships WHERE id IS NOT NULL;

-- Step 2: Delete institutions (which depend on users)
DELETE FROM institutions WHERE id IS NOT NULL;

-- Step 3: Delete from tables that depend on teams
DELETE FROM team_members WHERE id IS NOT NULL;
DELETE FROM ai_readiness_team_members WHERE id IS NOT NULL;
DELETE FROM teams WHERE id IS NOT NULL;
DELETE FROM ai_readiness_teams WHERE id IS NOT NULL;

-- Step 4: Delete vendor-related data that might reference users
DELETE FROM vendor_assessments WHERE id IS NOT NULL;
DELETE FROM vendor_audit_logs WHERE id IS NOT NULL;
DELETE FROM vendor_compliance_report WHERE id IS NOT NULL;
DELETE FROM vendor_control_dependencies WHERE id IS NOT NULL;
DELETE FROM vendor_data_flows WHERE id IS NOT NULL;
DELETE FROM vendor_decision_briefs WHERE id IS NOT NULL;
DELETE FROM vendor_intake_forms WHERE id IS NOT NULL;
DELETE FROM vendor_intakes WHERE id IS NOT NULL;
DELETE FROM vendor_mitigations WHERE id IS NOT NULL;
DELETE FROM vendor_profiles WHERE id IS NOT NULL;
DELETE FROM vendor_tools WHERE id IS NOT NULL;
DELETE FROM vendor_vetting_audit WHERE id IS NOT NULL;

-- Step 5: Delete approval-related data
DELETE FROM approval_approvers WHERE id IS NOT NULL;
DELETE FROM approval_audit_logs WHERE id IS NOT NULL;
DELETE FROM approval_comments WHERE id IS NOT NULL;
DELETE FROM approval_events WHERE id IS NOT NULL;
DELETE FROM approval_notifications WHERE id IS NOT NULL;
DELETE FROM approvals WHERE id IS NOT NULL;

-- Step 6: Delete assessment-related data
DELETE FROM assessment_metrics WHERE id IS NOT NULL;
DELETE FROM assessment_progress WHERE id IS NOT NULL;
DELETE FROM assessments WHERE id IS NOT NULL;
DELETE FROM ai_readiness_assessments WHERE id IS NOT NULL;

-- Step 7: Delete compliance and policy data
DELETE FROM compliance_evidence WHERE id IS NOT NULL;
DELETE FROM compliance_findings WHERE id IS NOT NULL;
DELETE FROM compliance_tracking WHERE id IS NOT NULL;
DELETE FROM risk_assessments WHERE id IS NOT NULL;
DELETE FROM policy_control_mappings WHERE id IS NOT NULL;
DELETE FROM policy_redline_packs WHERE id IS NOT NULL;
DELETE FROM policy_update_job_logs WHERE id IS NOT NULL;
DELETE FROM policy_update_notifications WHERE id IS NOT NULL;

-- Step 8: Delete framework-related data
DELETE FROM framework_changes WHERE id IS NOT NULL;
DELETE FROM framework_controls WHERE id IS NOT NULL;
DELETE FROM framework_metadata WHERE id IS NOT NULL;
DELETE FROM framework_scores WHERE id IS NOT NULL;
DELETE FROM framework_monitoring_config WHERE id IS NOT NULL;

-- Step 9: Delete document-related data
DELETE FROM decision_briefs WHERE id IS NOT NULL;
DELETE FROM document_sections WHERE id IS NOT NULL;
DELETE FROM documents WHERE id IS NOT NULL;
DELETE FROM artifacts WHERE id IS NOT NULL;

-- Step 10: Delete analytics and events
DELETE FROM analytics_events WHERE id IS NOT NULL;
DELETE FROM usage_analytics WHERE id IS NOT NULL;
DELETE FROM community_event_registrations WHERE id IS NOT NULL;
DELETE FROM community_join_requests WHERE id IS NOT NULL;

-- Step 11: Delete algorithm-related data
DELETE FROM enterprise_algorithm_changelog WHERE id IS NOT NULL;
DELETE FROM enterprise_algorithm_results WHERE id IS NOT NULL;

-- Step 12: Delete PII detections
DELETE FROM pii_detections WHERE id IS NOT NULL;

-- Step 13: Delete user-specific tables (these directly reference auth.users)
DELETE FROM auth_password_setup_tokens WHERE id IS NOT NULL;
DELETE FROM user_payments WHERE id IS NOT NULL;
DELETE FROM ai_readiness_payments WHERE id IS NOT NULL;
DELETE FROM user_profiles WHERE id IS NOT NULL;

-- Step 14: Finally, delete all users from auth.users
DELETE FROM auth.users WHERE id IS NOT NULL;

-- Verify cleanup
SELECT
    'Cleanup Complete!' as status,
    (SELECT COUNT(*) FROM auth.users) as remaining_users,
    (SELECT COUNT(*) FROM institutions) as remaining_institutions,
    (SELECT COUNT(*) FROM teams) as remaining_teams,
    (SELECT COUNT(*) FROM user_profiles) as remaining_profiles;
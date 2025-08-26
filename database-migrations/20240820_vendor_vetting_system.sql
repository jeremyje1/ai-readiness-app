-- =======================================
-- Vendor Vetting & Tool Approval System
-- Migration: 20240820_vendor_vetting_system.sql
-- =======================================

-- Vendor Profiles table - Basic vendor information
CREATE TABLE vendor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT NOT NULL UNIQUE,
    website_url TEXT,
    headquarters_location TEXT,
    business_model TEXT,
    size_category TEXT CHECK (size_category IN ('Startup', 'SMB', 'Enterprise', 'PublicCompany')),
    industry_focus TEXT[],
    established_year INTEGER,
    privacy_contact_email TEXT,
    security_contact_email TEXT,
    support_email TEXT,
    data_protection_officer TEXT,
    privacy_policy_url TEXT,
    terms_of_service_url TEXT,
    security_documentation_url TEXT,
    certification_status JSONB DEFAULT '{}',
    compliance_frameworks TEXT[] DEFAULT '{}',
    audit_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'conditional', 'rejected', 'suspended')),
    risk_score INTEGER DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
    trust_level TEXT DEFAULT 'unverified' CHECK (trust_level IN ('unverified', 'basic', 'verified', 'trusted', 'preferred'))
);

-- Vendor Tools table - Specific tools from vendors
CREATE TABLE vendor_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    tool_description TEXT,
    tool_category TEXT,
    tool_url TEXT,
    primary_function TEXT,
    target_audience TEXT[],
    age_range_min INTEGER DEFAULT 13,
    age_range_max INTEGER DEFAULT 18,
    grade_levels TEXT[] DEFAULT '{}',
    subject_areas TEXT[] DEFAULT '{}',
    technical_requirements JSONB DEFAULT '{}',
    integration_capabilities TEXT[] DEFAULT '{}',
    api_availability BOOLEAN DEFAULT FALSE,
    offline_capability BOOLEAN DEFAULT FALSE,
    mobile_support BOOLEAN DEFAULT TRUE,
    browser_requirements TEXT[] DEFAULT '{}',
    accessibility_features TEXT[] DEFAULT '{}',
    languages_supported TEXT[] DEFAULT ARRAY['English'],
    pricing_model TEXT,
    cost_structure JSONB DEFAULT '{}',
    free_tier_available BOOLEAN DEFAULT FALSE,
    trial_period_days INTEGER DEFAULT 0,
    contract_requirements TEXT,
    minimum_contract_length TEXT,
    cancellation_policy TEXT,
    data_residency TEXT DEFAULT 'United States',
    hosting_provider TEXT,
    encryption_standards TEXT[] DEFAULT '{}',
    backup_procedures TEXT,
    disaster_recovery_plan TEXT,
    uptime_guarantee NUMERIC(5,2),
    support_channels TEXT[] DEFAULT '{}',
    training_provided BOOLEAN DEFAULT FALSE,
    documentation_quality TEXT DEFAULT 'basic',
    onboarding_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'conditional', 'rejected', 'deprecated')),
    risk_assessment_id UUID,
    approval_date TIMESTAMP WITH TIME ZONE,
    last_compliance_review TIMESTAMP WITH TIME ZONE,
    next_review_due TIMESTAMP WITH TIME ZONE,
    active_users_count INTEGER DEFAULT 0,
    usage_statistics JSONB DEFAULT '{}',
    incident_history JSONB DEFAULT '[]',
    UNIQUE(vendor_id, tool_name)
);

-- Vendor Intake Forms table - Initial submission data
CREATE TABLE vendor_intake_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID, -- Link to parent assessment
    institution_id UUID,
    
    -- Submission metadata
    submitted_by TEXT NOT NULL,
    submitter_email TEXT,
    submitter_role TEXT,
    requesting_department TEXT,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    
    -- Basic tool information
    tool_name TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    tool_description TEXT,
    tool_url TEXT,
    requested_use_case TEXT,
    educational_objectives TEXT[],
    
    -- Target users and usage
    target_users TEXT[] DEFAULT '{}',
    estimated_user_count INTEGER,
    min_age INTEGER DEFAULT 13,
    max_age INTEGER DEFAULT 18,
    grade_levels TEXT[] DEFAULT '{}',
    subject_areas TEXT[] DEFAULT '{}',
    usage_frequency TEXT,
    concurrent_users_expected INTEGER,
    
    -- Technical specifications
    hosting_location TEXT DEFAULT 'United States',
    data_center_location TEXT,
    cloud_provider TEXT,
    model_provider TEXT,
    api_integrations TEXT[] DEFAULT '{}',
    authentication_method TEXT,
    single_sign_on_support BOOLEAN DEFAULT FALSE,
    
    -- Data handling and privacy
    data_collected TEXT[] DEFAULT '{}',
    pii_collected BOOLEAN DEFAULT FALSE,
    data_sharing BOOLEAN DEFAULT FALSE,
    data_sharing_partners TEXT[] DEFAULT '{}',
    data_retention_period TEXT DEFAULT '1 year',
    data_deletion_policy TEXT,
    training_on_user_data BOOLEAN DEFAULT FALSE,
    opt_out_available BOOLEAN DEFAULT FALSE,
    data_portability BOOLEAN DEFAULT FALSE,
    
    -- Compliance and safety
    age_gate_implemented BOOLEAN DEFAULT FALSE,
    parental_consent_required BOOLEAN DEFAULT FALSE,
    coppa_compliant BOOLEAN DEFAULT FALSE,
    ferpa_compliant BOOLEAN DEFAULT FALSE,
    ppra_compliant BOOLEAN DEFAULT FALSE,
    gdpr_compliant BOOLEAN DEFAULT FALSE,
    accessibility_compliant BOOLEAN DEFAULT FALSE,
    content_filtering BOOLEAN DEFAULT FALSE,
    moderation_features TEXT[] DEFAULT '{}',
    
    -- Commercial terms
    pricing_model TEXT,
    estimated_annual_cost NUMERIC(12,2) DEFAULT 0,
    contract_length TEXT DEFAULT '1 year',
    trial_available BOOLEAN DEFAULT FALSE,
    trial_duration_days INTEGER DEFAULT 0,
    pilot_program_requested BOOLEAN DEFAULT FALSE,
    
    -- Review assignment and status
    assigned_reviewer TEXT,
    review_status TEXT DEFAULT 'submitted' CHECK (review_status IN (
        'submitted', 'assigned', 'screening', 'risk_assessment', 
        'security_review', 'privacy_review', 'compliance_check',
        'board_review', 'approved', 'conditional', 'rejected', 'on_hold'
    )),
    review_priority TEXT DEFAULT 'normal',
    expected_completion_date TIMESTAMP WITH TIME ZONE,
    
    -- Additional context
    business_justification TEXT,
    alternatives_considered TEXT[],
    stakeholder_input TEXT,
    special_requirements TEXT,
    attachments JSONB DEFAULT '[]',
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk Assessments table - Automated and manual risk evaluations
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_form_id UUID REFERENCES vendor_intake_forms(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES vendor_tools(id),
    assessment_type TEXT DEFAULT 'initial' CHECK (assessment_type IN ('initial', 'annual', 'incident', 'change_request')),
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessor_name TEXT,
    assessor_role TEXT,
    
    -- Overall risk scores (0-100 scale)
    overall_risk_score INTEGER CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
    risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    
    -- Category-specific risk scores
    privacy_risk_score INTEGER CHECK (privacy_risk_score >= 0 AND privacy_risk_score <= 100),
    security_risk_score INTEGER CHECK (security_risk_score >= 0 AND security_risk_score <= 100),
    compliance_risk_score INTEGER CHECK (compliance_risk_score >= 0 AND compliance_risk_score <= 100),
    pedagogical_risk_score INTEGER CHECK (pedagogical_risk_score >= 0 AND pedagogical_risk_score <= 100),
    financial_risk_score INTEGER CHECK (financial_risk_score >= 0 AND financial_risk_score <= 100),
    operational_risk_score INTEGER CHECK (operational_risk_score >= 0 AND operational_risk_score <= 100),
    
    -- Detailed risk factors
    risk_factors JSONB DEFAULT '{}',
    mitigation_measures JSONB DEFAULT '{}',
    residual_risks JSONB DEFAULT '{}',
    
    -- Compliance checks
    coppa_assessment JSONB DEFAULT '{}',
    ferpa_assessment JSONB DEFAULT '{}',
    ppra_assessment JSONB DEFAULT '{}',
    state_law_assessment JSONB DEFAULT '{}',
    accessibility_assessment JSONB DEFAULT '{}',
    
    -- Security evaluation
    data_encryption_status TEXT,
    access_controls_rating TEXT,
    vulnerability_assessment JSONB DEFAULT '{}',
    penetration_test_results JSONB DEFAULT '{}',
    security_certifications TEXT[] DEFAULT '{}',
    
    -- Privacy evaluation
    privacy_policy_review JSONB DEFAULT '{}',
    data_minimization_score INTEGER,
    consent_mechanism_rating TEXT,
    data_subject_rights_support TEXT,
    cross_border_transfer_assessment JSONB DEFAULT '{}',
    
    -- Recommendations
    approval_recommendation TEXT CHECK (approval_recommendation IN ('approve', 'conditional_approval', 'reject', 'needs_more_info')),
    recommended_restrictions TEXT[] DEFAULT '{}',
    monitoring_requirements TEXT[] DEFAULT '{}',
    training_requirements TEXT[] DEFAULT '{}',
    review_schedule TEXT,
    
    -- Review tracking
    reviewed_by TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    approved_by TEXT,
    approval_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decision Briefs table - Board-ready decision documents
CREATE TABLE decision_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_assessment_id UUID REFERENCES risk_assessments(id) ON DELETE CASCADE,
    intake_form_id UUID REFERENCES vendor_intake_forms(id),
    
    -- Brief metadata
    brief_title TEXT NOT NULL,
    brief_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    prepared_by TEXT NOT NULL,
    review_board TEXT DEFAULT 'Technology Committee',
    meeting_date TIMESTAMP WITH TIME ZONE,
    
    -- Executive summary
    executive_summary TEXT NOT NULL,
    recommendation TEXT NOT NULL CHECK (recommendation IN ('Approve', 'Conditional Approval', 'Reject', 'Defer')),
    key_benefits TEXT[] DEFAULT '{}',
    primary_concerns TEXT[] DEFAULT '{}',
    
    -- Risk summary
    risk_level_summary TEXT,
    critical_risks TEXT[] DEFAULT '{}',
    acceptable_risks TEXT[] DEFAULT '{}',
    mitigation_plan TEXT,
    
    -- Compliance status
    compliance_summary JSONB DEFAULT '{}',
    regulatory_considerations TEXT,
    legal_review_required BOOLEAN DEFAULT FALSE,
    legal_review_status TEXT,
    
    -- Implementation plan
    implementation_timeline TEXT,
    pilot_program_recommended BOOLEAN DEFAULT FALSE,
    pilot_scope TEXT,
    training_plan TEXT,
    rollout_phases JSONB DEFAULT '[]',
    
    -- Monitoring and governance
    monitoring_plan TEXT,
    success_metrics TEXT[] DEFAULT '{}',
    review_schedule TEXT,
    escalation_procedures TEXT,
    
    -- Financial analysis
    cost_benefit_analysis TEXT,
    budget_impact NUMERIC(12,2),
    alternative_costs JSONB DEFAULT '{}',
    roi_projection TEXT,
    
    -- Decision record
    board_decision TEXT,
    decision_date TIMESTAMP WITH TIME ZONE,
    decision_rationale TEXT,
    voting_record JSONB DEFAULT '{}',
    dissenting_opinions TEXT,
    
    -- Implementation tracking
    implementation_status TEXT DEFAULT 'pending',
    implementation_start_date TIMESTAMP WITH TIME ZONE,
    go_live_date TIMESTAMP WITH TIME ZONE,
    actual_vs_planned_variance TEXT,
    
    -- Document management
    document_version INTEGER DEFAULT 1,
    document_status TEXT DEFAULT 'draft' CHECK (document_status IN ('draft', 'review', 'final', 'archived')),
    attachments JSONB DEFAULT '[]',
    related_documents JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approved Tools Catalog table - Final approved tools registry
CREATE TABLE approved_tools_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES vendor_tools(id),
    decision_brief_id UUID REFERENCES decision_briefs(id),
    
    -- Approval details
    approval_date TIMESTAMP WITH TIME ZONE NOT NULL,
    approved_by TEXT NOT NULL,
    approval_type TEXT DEFAULT 'full' CHECK (approval_type IN ('full', 'conditional', 'pilot', 'restricted')),
    expiration_date TIMESTAMP WITH TIME ZONE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    
    -- Usage permissions
    approved_roles TEXT[] NOT NULL DEFAULT '{}',
    approved_subjects TEXT[] DEFAULT '{}',
    approved_grade_levels TEXT[] DEFAULT '{}',
    approved_use_cases TEXT[] DEFAULT '{}',
    usage_restrictions TEXT[] DEFAULT '{}',
    
    -- Deployment configuration
    deployment_scope TEXT DEFAULT 'district_wide',
    max_concurrent_users INTEGER,
    seat_allocation JSONB DEFAULT '{}',
    organizational_units TEXT[] DEFAULT '{}',
    
    -- Compliance monitoring
    compliance_status TEXT DEFAULT 'Compliant' CHECK (compliance_status IN ('Compliant', 'Minor Issues', 'Major Issues', 'Non-Compliant')),
    last_compliance_check TIMESTAMP WITH TIME ZONE,
    next_compliance_review TIMESTAMP WITH TIME ZONE,
    compliance_notes TEXT,
    
    -- Usage analytics
    active_users_count INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    usage_trends JSONB DEFAULT '{}',
    user_feedback_score NUMERIC(3,2),
    
    -- Incident tracking
    incidents_count INTEGER DEFAULT 0,
    last_incident_date TIMESTAMP WITH TIME ZONE,
    incident_severity_history JSONB DEFAULT '[]',
    
    -- Support and training
    training_completion_rate NUMERIC(5,2) DEFAULT 0,
    support_tickets_count INTEGER DEFAULT 0,
    documentation_rating NUMERIC(3,2),
    
    -- Contract and licensing
    license_type TEXT,
    contract_start_date TIMESTAMP WITH TIME ZONE,
    contract_end_date TIMESTAMP WITH TIME ZONE,
    renewal_date TIMESTAMP WITH TIME ZONE,
    contract_value NUMERIC(12,2),
    payment_schedule TEXT,
    
    -- Administrative
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deprecated', 'expired')),
    status_reason TEXT,
    last_updated_by TEXT,
    change_log JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Monitoring table - Ongoing compliance tracking
CREATE TABLE compliance_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES approved_tools_catalog(id) ON DELETE CASCADE,
    
    -- Monitoring metadata
    monitoring_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    monitoring_type TEXT CHECK (monitoring_type IN ('scheduled', 'incident_driven', 'complaint_driven', 'audit')),
    monitoring_period_start TIMESTAMP WITH TIME ZONE,
    monitoring_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Compliance framework checks
    coppa_status TEXT DEFAULT 'compliant' CHECK (coppa_status IN ('compliant', 'minor_issues', 'major_issues', 'non_compliant', 'not_applicable')),
    coppa_findings JSONB DEFAULT '{}',
    ferpa_status TEXT DEFAULT 'compliant' CHECK (ferpa_status IN ('compliant', 'minor_issues', 'major_issues', 'non_compliant', 'not_applicable')),
    ferpa_findings JSONB DEFAULT '{}',
    ppra_status TEXT DEFAULT 'compliant' CHECK (ppra_status IN ('compliant', 'minor_issues', 'major_issues', 'non_compliant', 'not_applicable')),
    ppra_findings JSONB DEFAULT '{}',
    
    -- Usage compliance
    usage_within_approved_scope BOOLEAN DEFAULT TRUE,
    unauthorized_usage_incidents INTEGER DEFAULT 0,
    data_handling_compliance BOOLEAN DEFAULT TRUE,
    consent_management_compliance BOOLEAN DEFAULT TRUE,
    
    -- Security compliance
    security_controls_effective BOOLEAN DEFAULT TRUE,
    data_encryption_verified BOOLEAN DEFAULT TRUE,
    access_controls_verified BOOLEAN DEFAULT TRUE,
    vulnerability_scan_results JSONB DEFAULT '{}',
    
    -- Privacy compliance
    privacy_policy_current BOOLEAN DEFAULT TRUE,
    data_minimization_verified BOOLEAN DEFAULT TRUE,
    retention_policy_followed BOOLEAN DEFAULT TRUE,
    user_rights_requests_handled INTEGER DEFAULT 0,
    
    -- Recommendations and actions
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    issues_identified TEXT[] DEFAULT '{}',
    corrective_actions_required TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    
    -- Review and approval
    reviewed_by TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,
    approval_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Analytics table - Tool usage tracking and analytics
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES approved_tools_catalog(id) ON DELETE CASCADE,
    
    -- Time period
    analytics_date DATE NOT NULL,
    period_type TEXT DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
    
    -- Usage metrics
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    total_session_duration INTEGER DEFAULT 0, -- in minutes
    average_session_duration NUMERIC(8,2) DEFAULT 0,
    
    -- User breakdown
    teacher_users INTEGER DEFAULT 0,
    student_users INTEGER DEFAULT 0,
    admin_users INTEGER DEFAULT 0,
    parent_users INTEGER DEFAULT 0,
    
    -- Academic breakdown
    usage_by_grade JSONB DEFAULT '{}',
    usage_by_subject JSONB DEFAULT '{}',
    usage_by_department JSONB DEFAULT '{}',
    
    -- Feature usage
    features_used JSONB DEFAULT '{}',
    most_popular_features TEXT[] DEFAULT '{}',
    
    -- Performance metrics
    system_uptime NUMERIC(5,2) DEFAULT 100,
    response_time_avg NUMERIC(8,2), -- in milliseconds
    error_rate NUMERIC(5,4) DEFAULT 0,
    
    -- User satisfaction
    user_rating NUMERIC(3,2),
    feedback_count INTEGER DEFAULT 0,
    support_tickets INTEGER DEFAULT 0,
    
    -- Content and data
    content_created_count INTEGER DEFAULT 0,
    data_processed_volume NUMERIC(12,2), -- in MB
    storage_used NUMERIC(12,2), -- in MB
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tool_id, analytics_date, period_type)
);

-- Audit Trail table - Complete audit log for vendor vetting system
CREATE TABLE vendor_vetting_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference information
    entity_type TEXT NOT NULL CHECK (entity_type IN ('vendor_profile', 'vendor_tool', 'intake_form', 'risk_assessment', 'decision_brief', 'approved_tool', 'compliance_monitoring')),
    entity_id UUID NOT NULL,
    
    -- Action details
    action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'approve', 'reject', 'suspend', 'reactivate', 'review')),
    action_description TEXT,
    
    -- User and timestamp
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    user_role TEXT,
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Change details
    field_changed TEXT,
    old_value JSONB,
    new_value JSONB,
    change_reason TEXT,
    
    -- Context
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================================
-- Indexes for Performance
-- =======================================

-- Vendor Profiles indexes
CREATE INDEX idx_vendor_profiles_name ON vendor_profiles(vendor_name);
CREATE INDEX idx_vendor_profiles_status ON vendor_profiles(review_status);
CREATE INDEX idx_vendor_profiles_risk_score ON vendor_profiles(risk_score);
CREATE INDEX idx_vendor_profiles_created_at ON vendor_profiles(created_at);

-- Vendor Tools indexes
CREATE INDEX idx_vendor_tools_vendor_id ON vendor_tools(vendor_id);
CREATE INDEX idx_vendor_tools_name ON vendor_tools(tool_name);
CREATE INDEX idx_vendor_tools_category ON vendor_tools(tool_category);
CREATE INDEX idx_vendor_tools_status ON vendor_tools(status);
CREATE INDEX idx_vendor_tools_grade_levels ON vendor_tools USING GIN(grade_levels);
CREATE INDEX idx_vendor_tools_subject_areas ON vendor_tools USING GIN(subject_areas);

-- Intake Forms indexes
CREATE INDEX idx_intake_forms_assessment_id ON vendor_intake_forms(assessment_id);
CREATE INDEX idx_intake_forms_status ON vendor_intake_forms(review_status);
CREATE INDEX idx_intake_forms_submitted_by ON vendor_intake_forms(submitted_by);
CREATE INDEX idx_intake_forms_submission_date ON vendor_intake_forms(submission_date);
CREATE INDEX idx_intake_forms_assigned_reviewer ON vendor_intake_forms(assigned_reviewer);

-- Risk Assessments indexes
CREATE INDEX idx_risk_assessments_intake_form_id ON risk_assessments(intake_form_id);
CREATE INDEX idx_risk_assessments_tool_id ON risk_assessments(tool_id);
CREATE INDEX idx_risk_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX idx_risk_assessments_overall_score ON risk_assessments(overall_risk_score);

-- Decision Briefs indexes
CREATE INDEX idx_decision_briefs_risk_assessment_id ON decision_briefs(risk_assessment_id);
CREATE INDEX idx_decision_briefs_recommendation ON decision_briefs(recommendation);
CREATE INDEX idx_decision_briefs_brief_date ON decision_briefs(brief_date);

-- Approved Tools Catalog indexes
CREATE INDEX idx_approved_tools_tool_id ON approved_tools_catalog(tool_id);
CREATE INDEX idx_approved_tools_approval_date ON approved_tools_catalog(approval_date);
CREATE INDEX idx_approved_tools_status ON approved_tools_catalog(status);
CREATE INDEX idx_approved_tools_compliance_status ON approved_tools_catalog(compliance_status);
CREATE INDEX idx_approved_tools_roles ON approved_tools_catalog USING GIN(approved_roles);
CREATE INDEX idx_approved_tools_subjects ON approved_tools_catalog USING GIN(approved_subjects);
CREATE INDEX idx_approved_tools_grade_levels ON approved_tools_catalog USING GIN(approved_grade_levels);

-- Compliance Monitoring indexes
CREATE INDEX idx_compliance_monitoring_tool_id ON compliance_monitoring(tool_id);
CREATE INDEX idx_compliance_monitoring_date ON compliance_monitoring(monitoring_date);
CREATE INDEX idx_compliance_monitoring_type ON compliance_monitoring(monitoring_type);

-- Usage Analytics indexes
CREATE INDEX idx_usage_analytics_tool_id ON usage_analytics(tool_id);
CREATE INDEX idx_usage_analytics_date ON usage_analytics(analytics_date);
CREATE INDEX idx_usage_analytics_period_type ON usage_analytics(period_type);

-- Audit Trail indexes
CREATE INDEX idx_vendor_vetting_audit_entity ON vendor_vetting_audit(entity_type, entity_id);
CREATE INDEX idx_vendor_vetting_audit_user ON vendor_vetting_audit(user_id);
CREATE INDEX idx_vendor_vetting_audit_timestamp ON vendor_vetting_audit(action_timestamp);
CREATE INDEX idx_vendor_vetting_audit_action_type ON vendor_vetting_audit(action_type);

-- =======================================
-- Triggers for Automatic Updates
-- =======================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all relevant tables
CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON vendor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_tools_updated_at BEFORE UPDATE ON vendor_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_intake_forms_updated_at BEFORE UPDATE ON vendor_intake_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_decision_briefs_updated_at BEFORE UPDATE ON decision_briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approved_tools_catalog_updated_at BEFORE UPDATE ON approved_tools_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_monitoring_updated_at BEFORE UPDATE ON compliance_monitoring FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_analytics_updated_at BEFORE UPDATE ON usage_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit trail entries
CREATE OR REPLACE FUNCTION create_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO vendor_vetting_audit (
        entity_type,
        entity_id,
        action_type,
        action_description,
        user_id,
        user_name,
        old_value,
        new_value
    ) VALUES (
        CASE TG_TABLE_NAME
            WHEN 'vendor_profiles' THEN 'vendor_profile'
            WHEN 'vendor_tools' THEN 'vendor_tool'
            WHEN 'vendor_intake_forms' THEN 'intake_form'
            WHEN 'risk_assessments' THEN 'risk_assessment'
            WHEN 'decision_briefs' THEN 'decision_brief'
            WHEN 'approved_tools_catalog' THEN 'approved_tool'
            WHEN 'compliance_monitoring' THEN 'compliance_monitoring'
            ELSE TG_TABLE_NAME
        END,
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        TG_OP || ' operation on ' || TG_TABLE_NAME,
        auth.uid(),
        'system',
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply audit triggers to key tables
CREATE TRIGGER audit_vendor_profiles AFTER INSERT OR UPDATE OR DELETE ON vendor_profiles FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_vendor_tools AFTER INSERT OR UPDATE OR DELETE ON vendor_tools FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_risk_assessments AFTER INSERT OR UPDATE OR DELETE ON risk_assessments FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_decision_briefs AFTER INSERT OR UPDATE OR DELETE ON decision_briefs FOR EACH ROW EXECUTE FUNCTION create_audit_trail();
CREATE TRIGGER audit_approved_tools_catalog AFTER INSERT OR UPDATE OR DELETE ON approved_tools_catalog FOR EACH ROW EXECUTE FUNCTION create_audit_trail();

-- =======================================
-- Row Level Security (RLS) Policies
-- =======================================

-- Enable RLS on all tables
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_tools_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_vetting_audit ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read approved tools catalog
CREATE POLICY "Users can view approved tools" ON approved_tools_catalog
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin users to manage vendor vetting system
CREATE POLICY "Admins can manage vendor vetting" ON vendor_profiles
    FOR ALL USING (auth.jwt() ->> 'user_role' IN ('admin', 'privacy_officer', 'technology_director'));

CREATE POLICY "Admins can manage vendor tools" ON vendor_tools
    FOR ALL USING (auth.jwt() ->> 'user_role' IN ('admin', 'privacy_officer', 'technology_director'));

CREATE POLICY "Users can submit intake forms" ON vendor_intake_forms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own intake forms" ON vendor_intake_forms
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            auth.email() = submitter_email OR
            auth.jwt() ->> 'user_role' IN ('admin', 'privacy_officer', 'technology_director')
        )
    );

CREATE POLICY "Reviewers can manage risk assessments" ON risk_assessments
    FOR ALL USING (auth.jwt() ->> 'user_role' IN ('admin', 'privacy_officer', 'technology_director', 'reviewer'));

-- =======================================
-- Sample Data Insertion
-- =======================================

-- Insert sample vendor profiles
INSERT INTO vendor_profiles (vendor_name, website_url, headquarters_location, business_model, size_category, industry_focus, established_year, privacy_contact_email, review_status, risk_score, trust_level) VALUES
('OpenAI', 'https://openai.com', 'San Francisco, CA', 'B2B SaaS', 'Enterprise', ARRAY['AI/ML', 'Education Technology'], 2015, 'privacy@openai.com', 'approved', 35, 'verified'),
('Khan Academy', 'https://khanacademy.org', 'Mountain View, CA', 'Non-profit', 'Enterprise', ARRAY['Education', 'E-learning'], 2008, 'privacy@khanacademy.org', 'approved', 15, 'trusted'),
('Grammarly', 'https://grammarly.com', 'San Francisco, CA', 'Freemium SaaS', 'Enterprise', ARRAY['Writing Tools', 'Education Technology'], 2009, 'privacy@grammarly.com', 'approved', 25, 'verified');

-- Insert sample vendor tools
INSERT INTO vendor_tools (vendor_id, tool_name, tool_description, tool_category, target_audience, age_range_min, age_range_max, grade_levels, subject_areas, pricing_model, status, approval_date, last_compliance_review, active_users_count) VALUES
((SELECT id FROM vendor_profiles WHERE vendor_name = 'OpenAI'), 'ChatGPT for Education', 'AI-powered writing and research assistant with educational safeguards', 'Content Creation', ARRAY['Teachers', 'Students'], 13, 18, ARRAY['9-12'], ARRAY['English', 'History', 'Science'], 'Subscription', 'approved', NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days', 156),
((SELECT id FROM vendor_profiles WHERE vendor_name = 'Khan Academy'), 'Khan Academy AI Tutor', 'Personalized tutoring and learning assistance', 'Tutoring & Support', ARRAY['Students', 'Teachers'], 5, 18, ARRAY['K-12'], ARRAY['Math', 'Science'], 'Free', 'approved', NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days', 89),
((SELECT id FROM vendor_profiles WHERE vendor_name = 'Grammarly'), 'Grammarly Education', 'Writing enhancement and grammar checking tool', 'Content Creation', ARRAY['Teachers', 'Students'], 11, 18, ARRAY['6-12'], ARRAY['English', 'Writing'], 'Subscription', 'approved', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days', 234);

-- =======================================
-- Views for Common Queries
-- =======================================

-- View for approved tools with vendor information
CREATE VIEW approved_tools_with_vendor AS
SELECT 
    atc.id,
    vt.tool_name,
    vp.vendor_name,
    vt.tool_description,
    vt.tool_category,
    atc.approved_roles,
    atc.approved_subjects,
    atc.approved_grade_levels,
    atc.usage_restrictions,
    atc.compliance_status,
    atc.active_users_count,
    atc.last_compliance_check,
    atc.approval_date,
    atc.status
FROM approved_tools_catalog atc
JOIN vendor_tools vt ON atc.tool_id = vt.id
JOIN vendor_profiles vp ON vt.vendor_id = vp.id
WHERE atc.status = 'active';

-- View for pending intake forms with risk assessment status
CREATE VIEW intake_forms_with_status AS
SELECT 
    vif.id,
    vif.tool_name,
    vif.vendor_name,
    vif.submitted_by,
    vif.submission_date,
    vif.review_status,
    vif.assigned_reviewer,
    vif.expected_completion_date,
    ra.risk_level,
    ra.overall_risk_score,
    db.recommendation
FROM vendor_intake_forms vif
LEFT JOIN risk_assessments ra ON vif.id = ra.intake_form_id
LEFT JOIN decision_briefs db ON ra.id = db.risk_assessment_id
WHERE vif.review_status NOT IN ('approved', 'rejected');

-- View for compliance dashboard
CREATE VIEW compliance_dashboard AS
SELECT 
    vp.vendor_name,
    vt.tool_name,
    atc.compliance_status,
    atc.last_compliance_check,
    atc.next_compliance_review,
    atc.active_users_count,
    cm.coppa_status,
    cm.ferpa_status,
    cm.ppra_status,
    cm.compliance_score
FROM approved_tools_catalog atc
JOIN vendor_tools vt ON atc.tool_id = vt.id
JOIN vendor_profiles vp ON vt.vendor_id = vp.id
LEFT JOIN compliance_monitoring cm ON atc.id = cm.tool_id
WHERE atc.status = 'active'
ORDER BY atc.next_compliance_review ASC;

-- Grant permissions to authenticated users for views
GRANT SELECT ON approved_tools_with_vendor TO authenticated;
GRANT SELECT ON intake_forms_with_status TO authenticated;
GRANT SELECT ON compliance_dashboard TO authenticated;

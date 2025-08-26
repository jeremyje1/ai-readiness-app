/**
 * Vendor Intake System Database Schema
 * Complete schema for vendor assessment, risk evaluation, and compliance tracking
 * @version 1.0.0
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vendor intake main table
CREATE TABLE vendor_intakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'conditional')),
    
    -- Basic vendor information
    vendor_name VARCHAR(255) NOT NULL,
    vendor_url TEXT,
    vendor_description TEXT,
    vendor_category VARCHAR(100),
    contact_email VARCHAR(255),
    contact_name VARCHAR(255),
    business_justification TEXT,
    
    -- Assessment data (stored as JSONB for flexibility)
    assessment_data JSONB NOT NULL DEFAULT '{}',
    
    -- Risk assessment results
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_flags JSONB DEFAULT '[]',
    
    -- Decision information
    decision_outcome VARCHAR(20),
    decision_reason TEXT,
    decision_conditions JSONB DEFAULT '[]',
    decision_approver VARCHAR(255),
    decision_approved_at TIMESTAMP WITH TIME ZONE,
    decision_valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Request context
    requested_urgency VARCHAR(20) DEFAULT 'medium' CHECK (requested_urgency IN ('low', 'medium', 'high')),
    expected_launch_date TIMESTAMP WITH TIME ZONE,
    request_notes TEXT
);

-- Vendor mitigations table
CREATE TABLE vendor_mitigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendor_intakes(id) ON DELETE CASCADE,
    
    risk_flag VARCHAR(20) NOT NULL CHECK (risk_flag IN ('FERPA', 'COPPA', 'PPRA', 'GDPR', 'CCPA', 'SOX', 'HIPAA')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    mitigation_type VARCHAR(20) NOT NULL CHECK (mitigation_type IN ('technical', 'procedural', 'contractual', 'policy')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'implemented', 'verified')),
    
    assignee VARCHAR(255),
    due_date TIMESTAMP WITH TIME ZONE,
    evidence TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor data flows table
CREATE TABLE vendor_data_flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendor_intakes(id) ON DELETE CASCADE,
    
    flow_type VARCHAR(20) NOT NULL CHECK (flow_type IN ('inbound', 'outbound', 'bidirectional', 'none')),
    data_types JSONB DEFAULT '[]',
    frequency VARCHAR(20) CHECK (frequency IN ('real-time', 'daily', 'weekly', 'monthly', 'on-demand')),
    volume VARCHAR(20) CHECK (volume IN ('low', 'medium', 'high')),
    encryption_enabled BOOLEAN DEFAULT false,
    retention_period VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor assessments questionnaire responses
CREATE TABLE vendor_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendor_intakes(id) ON DELETE CASCADE,
    
    section VARCHAR(50) NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    response JSONB NOT NULL,
    risk_weight INTEGER DEFAULT 0,
    compliance_flags JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(vendor_id, section, question_id)
);

-- Decision briefs table
CREATE TABLE vendor_decision_briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendor_intakes(id) ON DELETE CASCADE,
    
    brief_data JSONB NOT NULL,
    pdf_url TEXT,
    generated_by VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Brief metadata
    recommendation VARCHAR(20) NOT NULL,
    risk_summary JSONB DEFAULT '{}',
    mitigation_summary JSONB DEFAULT '[]',
    approval_requirements JSONB DEFAULT '[]'
);

-- Tool catalog entries (approved vendors)
CREATE TABLE approved_tool_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendor_intakes(id),
    
    tool_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    usage_guidelines TEXT,
    restrictions JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    
    approved_by VARCHAR(255) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    review_frequency VARCHAR(50) DEFAULT 'annually',
    next_review_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(vendor_id)
);

-- Audit log for vendor intake activities
CREATE TABLE vendor_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendor_intakes(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,
    event_description TEXT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Data changes
    before_state JSONB,
    after_state JSONB,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_vendor_intakes_status ON vendor_intakes(status);
CREATE INDEX idx_vendor_intakes_created_by ON vendor_intakes(created_by);
CREATE INDEX idx_vendor_intakes_risk_level ON vendor_intakes(risk_level);
CREATE INDEX idx_vendor_intakes_created_at ON vendor_intakes(created_at);
CREATE INDEX idx_vendor_intakes_vendor_name ON vendor_intakes(vendor_name);

CREATE INDEX idx_vendor_mitigations_vendor_id ON vendor_mitigations(vendor_id);
CREATE INDEX idx_vendor_mitigations_status ON vendor_mitigations(status);
CREATE INDEX idx_vendor_mitigations_risk_flag ON vendor_mitigations(risk_flag);

CREATE INDEX idx_vendor_data_flows_vendor_id ON vendor_data_flows(vendor_id);
CREATE INDEX idx_vendor_data_flows_flow_type ON vendor_data_flows(flow_type);

CREATE INDEX idx_vendor_assessments_vendor_id ON vendor_assessments(vendor_id);
CREATE INDEX idx_vendor_assessments_section ON vendor_assessments(section);

CREATE INDEX idx_vendor_decision_briefs_vendor_id ON vendor_decision_briefs(vendor_id);
CREATE INDEX idx_vendor_decision_briefs_generated_at ON vendor_decision_briefs(generated_at);

CREATE INDEX idx_approved_tool_catalog_vendor_id ON approved_tool_catalog(vendor_id);
CREATE INDEX idx_approved_tool_catalog_category ON approved_tool_catalog(category);
CREATE INDEX idx_approved_tool_catalog_is_active ON approved_tool_catalog(is_active);

CREATE INDEX idx_vendor_audit_logs_vendor_id ON vendor_audit_logs(vendor_id);
CREATE INDEX idx_vendor_audit_logs_event_type ON vendor_audit_logs(event_type);
CREATE INDEX idx_vendor_audit_logs_user_id ON vendor_audit_logs(user_id);
CREATE INDEX idx_vendor_audit_logs_created_at ON vendor_audit_logs(created_at);

-- Create updated_at trigger for vendor_intakes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_intakes_updated_at 
    BEFORE UPDATE ON vendor_intakes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_mitigations_updated_at 
    BEFORE UPDATE ON vendor_mitigations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approved_tool_catalog_updated_at 
    BEFORE UPDATE ON approved_tool_catalog 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE vendor_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_mitigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_data_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_decision_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_tool_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (assuming auth.users table exists)
CREATE POLICY "Users can view vendor intakes they created or are assigned to review" ON vendor_intakes
    FOR SELECT USING (
        created_by = current_setting('app.user_id', true)::TEXT OR
        reviewed_by = current_setting('app.user_id', true)::TEXT OR
        current_setting('app.user_role', true)::TEXT IN ('admin', 'compliance_officer', 'security_lead')
    );

CREATE POLICY "Users can create vendor intakes" ON vendor_intakes
    FOR INSERT WITH CHECK (
        created_by = current_setting('app.user_id', true)::TEXT
    );

CREATE POLICY "Authorized users can update vendor intakes" ON vendor_intakes
    FOR UPDATE USING (
        created_by = current_setting('app.user_id', true)::TEXT OR
        current_setting('app.user_role', true)::TEXT IN ('admin', 'compliance_officer', 'security_lead')
    );

-- Similar policies for other tables
CREATE POLICY "Users can view mitigations for accessible vendors" ON vendor_mitigations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vendor_intakes v 
            WHERE v.id = vendor_mitigations.vendor_id 
            AND (
                v.created_by = current_setting('app.user_id', true)::TEXT OR
                v.reviewed_by = current_setting('app.user_id', true)::TEXT OR
                current_setting('app.user_role', true)::TEXT IN ('admin', 'compliance_officer', 'security_lead')
            )
        )
    );

-- Create view for vendor dashboard
CREATE VIEW vendor_dashboard AS
SELECT 
    vi.id,
    vi.vendor_name,
    vi.status,
    vi.risk_level,
    vi.risk_score,
    vi.created_at,
    vi.created_by,
    vi.reviewed_by,
    vi.decision_outcome,
    
    -- Mitigation counts
    (SELECT COUNT(*) FROM vendor_mitigations vm WHERE vm.vendor_id = vi.id) as total_mitigations,
    (SELECT COUNT(*) FROM vendor_mitigations vm WHERE vm.vendor_id = vi.id AND vm.status = 'pending') as pending_mitigations,
    
    -- Risk flag summary
    COALESCE(array_length(array(SELECT jsonb_array_elements_text(vi.risk_flags)), 1), 0) as risk_flag_count,
    
    -- Catalog status
    EXISTS(SELECT 1 FROM approved_tool_catalog atc WHERE atc.vendor_id = vi.id AND atc.is_active = true) as in_catalog
    
FROM vendor_intakes vi
ORDER BY vi.created_at DESC;

-- Create materialized view for reporting
CREATE MATERIALIZED VIEW vendor_compliance_report AS
SELECT 
    DATE_TRUNC('month', vi.created_at) as month,
    vi.status,
    vi.risk_level,
    COUNT(*) as vendor_count,
    AVG(vi.risk_score) as avg_risk_score,
    
    -- Compliance flag counts
    SUM(CASE WHEN vi.risk_flags::text LIKE '%FERPA%' THEN 1 ELSE 0 END) as ferpa_flagged,
    SUM(CASE WHEN vi.risk_flags::text LIKE '%COPPA%' THEN 1 ELSE 0 END) as coppa_flagged,
    SUM(CASE WHEN vi.risk_flags::text LIKE '%PPRA%' THEN 1 ELSE 0 END) as ppra_flagged,
    
    -- Decision metrics
    AVG(EXTRACT(EPOCH FROM (vi.decision_approved_at - vi.created_at)) / 86400) as avg_decision_days
    
FROM vendor_intakes vi
WHERE vi.created_at >= DATE_TRUNC('year', NOW()) - INTERVAL '2 years'
GROUP BY DATE_TRUNC('month', vi.created_at), vi.status, vi.risk_level
ORDER BY month DESC, vi.status, vi.risk_level;

-- Function to refresh compliance report
CREATE OR REPLACE FUNCTION refresh_vendor_compliance_report()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW vendor_compliance_report;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE vendor_intakes IS 'Main table for vendor intake and assessment tracking';
COMMENT ON TABLE vendor_mitigations IS 'Risk mitigation actions for vendor compliance';
COMMENT ON TABLE vendor_data_flows IS 'Data flow documentation for vendor integrations';
COMMENT ON TABLE vendor_assessments IS 'Questionnaire responses and assessment data';
COMMENT ON TABLE vendor_decision_briefs IS 'Generated decision briefs and recommendations';
COMMENT ON TABLE approved_tool_catalog IS 'Catalog of approved vendor tools and services';
COMMENT ON TABLE vendor_audit_logs IS 'Audit trail for all vendor-related activities';

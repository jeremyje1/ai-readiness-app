-- Assessment 2.0 Complete Implementation Schema
-- Document processing, approvals, vendor vetting, dashboards, and policy watchers
-- Version: 1.0.0
-- Date: 2025-08-25

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- =====================================================
-- ASSESSMENT 2.0: DOCUMENT PROCESSING
-- =====================================================

-- Document uploads table
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'uploaded',
  pii_detected BOOLEAN DEFAULT FALSE,
  pii_redacted_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_status CHECK (status IN ('uploaded', 'scanning', 'processing', 'complete', 'failed')),
  INDEX idx_uploads_user (user_id),
  INDEX idx_uploads_institution (institution_id),
  INDEX idx_uploads_status (status),
  INDEX idx_uploads_created (created_at DESC)
);

-- Processing results table
CREATE TABLE IF NOT EXISTS processing_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
  extracted_text TEXT,
  extracted_text_hash VARCHAR(64), -- For deduplication
  entities JSONB DEFAULT '{}',
  frameworks TEXT[] DEFAULT '{}',
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(upload_id),
  INDEX idx_results_upload (upload_id),
  INDEX idx_results_hash (extracted_text_hash)
);

-- Gap analysis findings
CREATE TABLE IF NOT EXISTS gap_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES processing_results(id) ON DELETE CASCADE,
  section VARCHAR(500) NOT NULL,
  requirement TEXT NOT NULL,
  current_state TEXT,
  gap TEXT NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  remediation TEXT NOT NULL,
  framework VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  
  CONSTRAINT valid_risk CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  INDEX idx_gaps_result (result_id),
  INDEX idx_gaps_risk (risk_level),
  INDEX idx_gaps_framework (framework)
);

-- Policy redlines
CREATE TABLE IF NOT EXISTS policy_redlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES processing_results(id) ON DELETE CASCADE,
  section VARCHAR(500) NOT NULL,
  original_text TEXT NOT NULL,
  suggested_text TEXT NOT NULL,
  rationale TEXT NOT NULL,
  framework VARCHAR(100) NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  sort_order INTEGER DEFAULT 0,
  
  INDEX idx_redlines_result (result_id),
  INDEX idx_redlines_framework (framework),
  INDEX idx_redlines_confidence (confidence_score DESC)
);

-- Generated artifacts
CREATE TABLE IF NOT EXISTS generated_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES processing_results(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  format VARCHAR(10) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  storage_url TEXT NOT NULL,
  file_size BIGINT,
  signed_url TEXT,
  signed_url_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_type CHECK (type IN ('gap-analysis', 'policy-draft', 'board-deck', 'implementation-plan', 'decision-brief')),
  CONSTRAINT valid_format CHECK (format IN ('pdf', 'docx', 'pptx', 'xlsx', 'csv')),
  INDEX idx_artifacts_result (result_id),
  INDEX idx_artifacts_type (type),
  INDEX idx_artifacts_created (created_at DESC)
);

-- =====================================================
-- APPROVALS WORKFLOW
-- =====================================================

-- Approval workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES document_uploads(id) ON DELETE SET NULL,
  artifact_id UUID REFERENCES generated_artifacts(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  deadline TIMESTAMPTZ,
  require_sequential BOOLEAN DEFAULT FALSE,
  require_all_approvals BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_workflow_status CHECK (status IN ('draft', 'in-review', 'approved', 'rejected', 'expired', 'cancelled')),
  CONSTRAINT has_document CHECK (document_id IS NOT NULL OR artifact_id IS NOT NULL),
  INDEX idx_workflows_owner (owner_id),
  INDEX idx_workflows_institution (institution_id),
  INDEX idx_workflows_status (status),
  INDEX idx_workflows_deadline (deadline)
);

-- Approval requests
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  role VARCHAR(50) NOT NULL DEFAULT 'approver',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  comments TEXT,
  decided_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_role CHECK (role IN ('reviewer', 'approver', 'final-approver')),
  CONSTRAINT valid_request_status CHECK (status IN ('pending', 'approved', 'rejected', 'abstained')),
  UNIQUE(workflow_id, approver_id),
  INDEX idx_requests_workflow (workflow_id),
  INDEX idx_requests_approver (approver_id),
  INDEX idx_requests_status (status)
);

-- E-signatures
CREATE TABLE IF NOT EXISTS e_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL REFERENCES auth.users(id),
  signature_data TEXT NOT NULL, -- Base64 encoded
  ip_address INET NOT NULL,
  user_agent TEXT,
  certificate_id VARCHAR(100),
  verified BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(request_id),
  INDEX idx_signatures_request (request_id),
  INDEX idx_signatures_signer (signer_id),
  INDEX idx_signatures_signed (signed_at DESC)
);

-- Approval comments (threaded)
CREATE TABLE IF NOT EXISTS approval_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  parent_id UUID REFERENCES approval_comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_comments_workflow (workflow_id),
  INDEX idx_comments_user (user_id),
  INDEX idx_comments_parent (parent_id),
  INDEX idx_comments_created (created_at DESC)
);

-- =====================================================
-- VENDOR VETTING SYSTEM
-- =====================================================

-- Vendor submissions
CREATE TABLE IF NOT EXISTS vendor_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_name VARCHAR(255) NOT NULL,
  vendor_website VARCHAR(500),
  product_name VARCHAR(255) NOT NULL,
  product_category TEXT[] DEFAULT '{}',
  submitter_id UUID NOT NULL REFERENCES auth.users(id),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  status VARCHAR(50) NOT NULL DEFAULT 'intake',
  intake_form JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_vendor_status CHECK (status IN ('intake', 'reviewing', 'scored', 'approved', 'rejected')),
  INDEX idx_vendors_submitter (submitter_id),
  INDEX idx_vendors_institution (institution_id),
  INDEX idx_vendors_status (status),
  INDEX idx_vendors_name (vendor_name)
);

-- Vendor documents
CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES vendor_submissions(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  extracted_text TEXT,
  analysis_results JSONB DEFAULT '{}',
  uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  analyzed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_doc_type CHECK (type IN ('privacy-policy', 'terms', 'security-cert', 'soc2', 'iso27001', 'other')),
  INDEX idx_vendor_docs_submission (submission_id),
  INDEX idx_vendor_docs_type (type)
);

-- Vendor risk scores
CREATE TABLE IF NOT EXISTS vendor_risk_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES vendor_submissions(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  data_privacy_score INTEGER NOT NULL CHECK (data_privacy_score >= 0 AND data_privacy_score <= 100),
  data_privacy_level VARCHAR(20) NOT NULL,
  security_score INTEGER NOT NULL CHECK (security_score >= 0 AND security_score <= 100),
  security_level VARCHAR(20) NOT NULL,
  compliance_score INTEGER NOT NULL CHECK (compliance_score >= 0 AND compliance_score <= 100),
  compliance_level VARCHAR(20) NOT NULL,
  ai_ethics_score INTEGER NOT NULL CHECK (ai_ethics_score >= 0 AND ai_ethics_score <= 100),
  ai_ethics_level VARCHAR(20) NOT NULL,
  student_safety_score INTEGER NOT NULL CHECK (student_safety_score >= 0 AND student_safety_score <= 100),
  student_safety_level VARCHAR(20) NOT NULL,
  findings JSONB DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  concerns JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_levels CHECK (
    data_privacy_level IN ('low', 'medium', 'high', 'critical') AND
    security_level IN ('low', 'medium', 'high', 'critical') AND
    compliance_level IN ('low', 'medium', 'high', 'critical') AND
    ai_ethics_level IN ('low', 'medium', 'high', 'critical') AND
    student_safety_level IN ('low', 'medium', 'high', 'critical')
  ),
  UNIQUE(submission_id),
  INDEX idx_risk_scores_submission (submission_id),
  INDEX idx_risk_scores_overall (overall_score DESC)
);

-- Vendor decision briefs
CREATE TABLE IF NOT EXISTS vendor_decision_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES vendor_submissions(id) ON DELETE CASCADE,
  executive_summary TEXT NOT NULL,
  recommendation VARCHAR(20) NOT NULL,
  conditions TEXT[] DEFAULT '{}',
  key_risks TEXT[] DEFAULT '{}',
  mitigations TEXT[] DEFAULT '{}',
  alternative_vendors TEXT[] DEFAULT '{}',
  artifact_id UUID REFERENCES generated_artifacts(id),
  generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_recommendation CHECK (recommendation IN ('approve', 'conditional', 'reject')),
  UNIQUE(submission_id),
  INDEX idx_briefs_submission (submission_id),
  INDEX idx_briefs_recommendation (recommendation)
);

-- =====================================================
-- EXECUTIVE DASHBOARDS & TELEMETRY
-- =====================================================

-- Dashboard metrics
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  trend VARCHAR(10),
  period VARCHAR(20) NOT NULL,
  dimensions JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_metric_type CHECK (type IN ('readiness', 'adoption', 'compliance', 'risk', 'benchmark')),
  CONSTRAINT valid_trend CHECK (trend IN ('up', 'down', 'stable')),
  CONSTRAINT valid_period CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  INDEX idx_metrics_institution (institution_id),
  INDEX idx_metrics_type (type),
  INDEX idx_metrics_calculated (calculated_at DESC),
  INDEX idx_metrics_name (name)
);

-- Readiness scores (snapshot)
CREATE TABLE IF NOT EXISTS readiness_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES organizational_assessments(id),
  overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  leadership_score DECIMAL(5,2) NOT NULL CHECK (leadership_score >= 0 AND leadership_score <= 100),
  infrastructure_score DECIMAL(5,2) NOT NULL CHECK (infrastructure_score >= 0 AND infrastructure_score <= 100),
  data_governance_score DECIMAL(5,2) NOT NULL CHECK (data_governance_score >= 0 AND data_governance_score <= 100),
  academic_score DECIMAL(5,2) NOT NULL CHECK (academic_score >= 0 AND academic_score <= 100),
  community_score DECIMAL(5,2) NOT NULL CHECK (community_score >= 0 AND community_score <= 100),
  maturity_level INTEGER NOT NULL CHECK (maturity_level >= 1 AND maturity_level <= 5),
  calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_readiness_institution (institution_id),
  INDEX idx_readiness_calculated (calculated_at DESC)
);

-- Adoption telemetry
CREATE TABLE IF NOT EXISTS adoption_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  session_id VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE,
  
  INDEX idx_telemetry_event (event_type),
  INDEX idx_telemetry_user (user_id),
  INDEX idx_telemetry_institution (institution_id),
  INDEX idx_telemetry_timestamp (timestamp DESC),
  INDEX idx_telemetry_processed (processed)
);

-- Benchmark comparisons
CREATE TABLE IF NOT EXISTS benchmark_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  peer_group VARCHAR(100) NOT NULL,
  quarter VARCHAR(7) NOT NULL, -- YYYY-QN
  metrics JSONB NOT NULL DEFAULT '{}',
  peer_count INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(institution_id, peer_group, quarter),
  INDEX idx_benchmarks_institution (institution_id),
  INDEX idx_benchmarks_quarter (quarter DESC)
);

-- =====================================================
-- POLICY UPDATE WATCHERS
-- =====================================================

-- Policy watchers
CREATE TABLE IF NOT EXISTS policy_watchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES generated_artifacts(id) ON DELETE CASCADE,
  policy_name VARCHAR(500) NOT NULL,
  frameworks TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  last_checked TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  next_check TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 day'),
  check_frequency INTERVAL DEFAULT '1 day',
  notify_emails TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_watchers_institution (institution_id),
  INDEX idx_watchers_enabled (enabled),
  INDEX idx_watchers_next_check (next_check),
  INDEX idx_watchers_frameworks (frameworks USING GIN)
);

-- Framework updates
CREATE TABLE IF NOT EXISTS framework_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework VARCHAR(100) NOT NULL,
  version VARCHAR(50) NOT NULL,
  previous_version VARCHAR(50),
  published_date DATE NOT NULL,
  source_url TEXT,
  summary TEXT,
  changes JSONB DEFAULT '[]',
  detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE,
  
  UNIQUE(framework, version),
  INDEX idx_framework_updates_framework (framework),
  INDEX idx_framework_updates_published (published_date DESC),
  INDEX idx_framework_updates_processed (processed)
);

-- Policy update alerts
CREATE TABLE IF NOT EXISTS policy_update_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watcher_id UUID NOT NULL REFERENCES policy_watchers(id) ON DELETE CASCADE,
  update_id UUID NOT NULL REFERENCES framework_updates(id),
  impacted_sections TEXT[] DEFAULT '{}',
  suggested_redlines JSONB DEFAULT '[]',
  impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_alert_status CHECK (status IN ('pending', 'reviewed', 'applied', 'dismissed')),
  INDEX idx_alerts_watcher (watcher_id),
  INDEX idx_alerts_update (update_id),
  INDEX idx_alerts_status (status),
  INDEX idx_alerts_created (created_at DESC)
);

-- =====================================================
-- AUDIT & SECURITY
-- =====================================================

-- Comprehensive audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_institution (institution_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_resource (resource_type, resource_id),
  INDEX idx_audit_created (created_at DESC)
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to calculate readiness scores
CREATE OR REPLACE FUNCTION calculate_readiness_score(p_institution_id UUID)
RETURNS TABLE(
  overall DECIMAL(5,2),
  leadership DECIMAL(5,2),
  infrastructure DECIMAL(5,2),
  data_governance DECIMAL(5,2),
  academic DECIMAL(5,2),
  community DECIMAL(5,2),
  maturity_level INTEGER
) AS $$
BEGIN
  -- Implementation would calculate based on assessment responses
  -- This is a placeholder that returns mock data
  RETURN QUERY
  SELECT 
    75.50::DECIMAL(5,2) as overall,
    80.00::DECIMAL(5,2) as leadership,
    70.00::DECIMAL(5,2) as infrastructure,
    65.00::DECIMAL(5,2) as data_governance,
    85.00::DECIMAL(5,2) as academic,
    77.50::DECIMAL(5,2) as community,
    3 as maturity_level;
END;
$$ LANGUAGE plpgsql;

-- Function to anonymize institution data for benchmarking
CREATE OR REPLACE FUNCTION anonymize_benchmark_data(p_institution_id UUID, p_metric JSONB)
RETURNS JSONB AS $$
DECLARE
  v_anonymized JSONB;
BEGIN
  -- Remove any identifying information
  v_anonymized := p_metric - 'institution_name' - 'institution_id' - 'location';
  RETURN v_anonymized;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search indexes on document processing
CREATE OR REPLACE FUNCTION update_document_search_index()
RETURNS TRIGGER AS $$
BEGIN
  -- Update full-text search vectors (implementation depends on search strategy)
  -- This is a placeholder
  NEW.metadata := NEW.metadata || jsonb_build_object('indexed_at', CURRENT_TIMESTAMP);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_index
  BEFORE INSERT OR UPDATE ON processing_results
  FOR EACH ROW
  EXECUTE FUNCTION update_document_search_index();

-- Trigger to audit sensitive operations
CREATE OR REPLACE FUNCTION audit_sensitive_operation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    institution_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    current_setting('app.current_user_id', true)::UUID,
    COALESCE(NEW.institution_id, OLD.institution_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    jsonb_build_object('timestamp', CURRENT_TIMESTAMP)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_approval_workflows
  AFTER INSERT OR UPDATE OR DELETE ON approval_workflows
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operation();

CREATE TRIGGER audit_vendor_submissions
  AFTER INSERT OR UPDATE OR DELETE ON vendor_submissions
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operation();

CREATE TRIGGER audit_policy_watchers
  AFTER INSERT OR UPDATE OR DELETE ON policy_watchers
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operation();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_redlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_watchers ENABLE ROW LEVEL SECURITY;

-- Document uploads: Users can see their own and institution's uploads
CREATE POLICY document_uploads_select ON document_uploads
  FOR SELECT USING (
    user_id = auth.uid() OR
    institution_id IN (
      SELECT institution_id FROM institution_users 
      WHERE user_id = auth.uid() AND active = true
    )
  );

-- Approval workflows: Participants can view
CREATE POLICY approval_workflows_select ON approval_workflows
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT workflow_id FROM approval_requests 
      WHERE approver_id = auth.uid()
    ) OR
    institution_id IN (
      SELECT institution_id FROM institution_users 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Dashboard metrics: Institution members can view
CREATE POLICY dashboard_metrics_select ON dashboard_metrics
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM institution_users 
      WHERE user_id = auth.uid() AND active = true
    )
  );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Text search indexes
CREATE INDEX idx_extracted_text_search ON processing_results 
  USING GIN (to_tsvector('english', extracted_text));

CREATE INDEX idx_gap_analysis_search ON gap_analyses 
  USING GIN (to_tsvector('english', requirement || ' ' || gap || ' ' || remediation));

-- JSONB indexes
CREATE INDEX idx_intake_form_gin ON vendor_submissions 
  USING GIN (intake_form);

CREATE INDEX idx_telemetry_metadata_gin ON adoption_telemetry 
  USING GIN (metadata);

-- Composite indexes for common queries
CREATE INDEX idx_uploads_institution_status_created 
  ON document_uploads(institution_id, status, created_at DESC);

CREATE INDEX idx_workflows_institution_status_deadline 
  ON approval_workflows(institution_id, status, deadline);

CREATE INDEX idx_metrics_institution_type_period_calculated 
  ON dashboard_metrics(institution_id, type, period, calculated_at DESC);

-- =====================================================
-- INITIAL DATA & PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create initial framework entries
INSERT INTO framework_updates (framework, version, published_date, summary) VALUES
  ('NIST AI RMF', '1.0', '2023-01-26', 'Initial NIST AI Risk Management Framework'),
  ('FERPA', '2023.1', '2023-06-15', 'FERPA guidance on AI in education'),
  ('COPPA', '2023.2', '2023-09-01', 'Updated COPPA rules for AI systems')
ON CONFLICT (framework, version) DO NOTHING;

-- Create materialized view for faster dashboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_institution_metrics AS
SELECT 
  i.id as institution_id,
  i.name as institution_name,
  i.type as institution_type,
  COUNT(DISTINCT du.id) as total_uploads,
  COUNT(DISTINCT aw.id) as total_approvals,
  COUNT(DISTINCT vs.id) as total_vendors,
  AVG(rs.overall_score) as avg_readiness_score,
  MAX(rs.calculated_at) as last_assessment_date
FROM institutions i
LEFT JOIN document_uploads du ON du.institution_id = i.id
LEFT JOIN approval_workflows aw ON aw.institution_id = i.id
LEFT JOIN vendor_submissions vs ON vs.institution_id = i.id
LEFT JOIN readiness_scores rs ON rs.institution_id = i.id
GROUP BY i.id, i.name, i.type;

-- Create index on materialized view
CREATE INDEX idx_mv_metrics_institution ON mv_institution_metrics(institution_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_institution_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_institution_metrics;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE document_uploads IS 'Stores uploaded documents for Assessment 2.0 processing';
COMMENT ON TABLE approval_workflows IS 'Manages approval processes for policies and artifacts';
COMMENT ON TABLE vendor_submissions IS 'Tracks vendor vetting requests and evaluations';
COMMENT ON TABLE dashboard_metrics IS 'Stores calculated metrics for executive dashboards';
COMMENT ON TABLE policy_watchers IS 'Monitors framework changes and triggers policy updates';

-- Migration complete
DO $$
BEGIN
  RAISE NOTICE 'Assessment 2.0 Complete Implementation schema created successfully';
END $$;

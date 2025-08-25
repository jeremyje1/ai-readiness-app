-- Assessment 2.0 Database Schema
-- Document uploads and processing results

-- Document uploads table
CREATE TABLE IF NOT EXISTS document_uploads (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'pptx', 'xlsx', 'csv', 'html', 'image')),
  file_size INTEGER NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd')),
  upload_status TEXT NOT NULL DEFAULT 'uploaded' CHECK (upload_status IN ('uploaded', 'processing', 'completed', 'error')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Processing results
  processing_time INTEGER, -- milliseconds
  pii_detected BOOLEAN DEFAULT FALSE,
  frameworks_analyzed INTEGER DEFAULT 0,
  artifacts_generated INTEGER DEFAULT 0,
  
  -- Algorithm scores (0-100)
  airix_score INTEGER CHECK (airix_score >= 0 AND airix_score <= 100),
  airs_score INTEGER CHECK (airs_score >= 0 AND airs_score <= 100),
  aics_score INTEGER CHECK (aics_score >= 0 AND aics_score <= 100),
  aims_score INTEGER CHECK (aims_score >= 0 AND aims_score <= 100),
  aips_score INTEGER CHECK (aips_score >= 0 AND aips_score <= 100),
  aibs_score INTEGER CHECK (aibs_score >= 0 AND aibs_score <= 100),
  composite_score INTEGER CHECK (composite_score >= 0 AND composite_score <= 100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PII detections table
CREATE TABLE IF NOT EXISTS pii_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
  detection_type TEXT NOT NULL CHECK (detection_type IN ('SSN', 'STUDENT_ID', 'EMAIL', 'PHONE', 'ADDRESS', 'NAME', 'DOB')),
  detected_text TEXT NOT NULL,
  position_start INTEGER NOT NULL,
  position_end INTEGER NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  compliance_risk TEXT NOT NULL CHECK (compliance_risk IN ('FERPA', 'COPPA', 'GDPR', 'CCPA')),
  suggested_redaction TEXT,
  status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'reviewed', 'redacted', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Semantic classifications table
CREATE TABLE IF NOT EXISTS semantic_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Governance', 'Risk', 'Instruction', 'Assessment', 'Data', 'Vendor', 'Accessibility')),
  content_excerpt TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  key_terms TEXT[], -- Array of extracted key terms
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Framework mappings table
CREATE TABLE IF NOT EXISTS framework_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
  framework_name TEXT NOT NULL CHECK (framework_name IN ('NIST_AI_RMF', 'ED_GUIDANCE', 'STATE_AI_GUIDANCE')),
  control_id TEXT NOT NULL,
  control_title TEXT NOT NULL,
  control_description TEXT,
  current_state TEXT NOT NULL CHECK (current_state IN ('compliant', 'partial', 'missing', 'unknown')),
  evidence TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  gap_score INTEGER CHECK (gap_score >= 0 AND gap_score <= 100),
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated artifacts table
CREATE TABLE IF NOT EXISTS generated_artifacts (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('gap_analysis', 'policy_draft', 'board_deck', 'approval_workflow', 'training_curriculum', 'compliance_matrix')),
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd')),
  title TEXT NOT NULL,
  file_format TEXT NOT NULL CHECK (file_format IN ('pdf', 'docx', 'pptx', 'xlsx', 'html')),
  download_url TEXT NOT NULL,
  file_size INTEGER,
  framework_used TEXT,
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'downloaded', 'reviewed', 'approved')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval workflows table
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id TEXT NOT NULL REFERENCES generated_artifacts(id) ON DELETE CASCADE,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd')),
  
  -- Workflow stages
  current_stage TEXT NOT NULL DEFAULT 'initial_review',
  stages JSONB NOT NULL, -- Array of workflow stages with approvers and status
  
  -- Approval tracking
  approvals JSONB DEFAULT '[]', -- Array of approval records
  comments JSONB DEFAULT '[]', -- Array of comments and feedback
  
  -- Status and timing
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly deliverables tracking
CREATE TABLE IF NOT EXISTS monthly_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd')),
  month_year TEXT NOT NULL, -- Format: '2025-08'
  deliverable_type TEXT NOT NULL CHECK (deliverable_type IN ('policy_analysis', 'implementation_package', 'compliance_update', 'training_materials')),
  
  -- Deliverable status
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delivered')),
  artifacts JSONB DEFAULT '[]', -- Array of artifact IDs included in this deliverable
  
  -- Key metrics
  documents_processed INTEGER DEFAULT 0,
  policies_generated INTEGER DEFAULT 0,
  compliance_gaps_identified INTEGER DEFAULT 0,
  training_modules_created INTEGER DEFAULT 0,
  
  -- Delivery tracking
  planned_delivery_date DATE,
  actual_delivery_date DATE,
  client_notified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription value tracking (for retention analytics)
CREATE TABLE IF NOT EXISTS subscription_value_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd')),
  month_year TEXT NOT NULL,
  
  -- Value metrics
  time_saved_hours DECIMAL(5,2), -- Hours saved through automation
  cost_avoided_dollars DECIMAL(10,2), -- Cost avoided vs hiring consultants
  policies_updated INTEGER DEFAULT 0,
  compliance_issues_resolved INTEGER DEFAULT 0,
  training_participants INTEGER DEFAULT 0,
  
  -- Engagement metrics
  documents_uploaded INTEGER DEFAULT 0,
  artifacts_downloaded INTEGER DEFAULT 0,
  board_presentations_given INTEGER DEFAULT 0,
  policies_implemented INTEGER DEFAULT 0,
  
  -- Risk reduction
  pii_exposures_prevented INTEGER DEFAULT 0,
  compliance_violations_avoided INTEGER DEFAULT 0,
  vendor_risks_identified INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(assessment_id, month_year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_uploads_assessment_id ON document_uploads(assessment_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_status ON document_uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_document_uploads_institution_type ON document_uploads(institution_type);
CREATE INDEX IF NOT EXISTS idx_document_uploads_uploaded_at ON document_uploads(uploaded_at);

CREATE INDEX IF NOT EXISTS idx_pii_detections_document_id ON pii_detections(document_id);
CREATE INDEX IF NOT EXISTS idx_pii_detections_type ON pii_detections(detection_type);
CREATE INDEX IF NOT EXISTS idx_pii_detections_risk ON pii_detections(compliance_risk);

CREATE INDEX IF NOT EXISTS idx_semantic_classifications_document_id ON semantic_classifications(document_id);
CREATE INDEX IF NOT EXISTS idx_semantic_classifications_category ON semantic_classifications(category);

CREATE INDEX IF NOT EXISTS idx_framework_mappings_document_id ON framework_mappings(document_id);
CREATE INDEX IF NOT EXISTS idx_framework_mappings_framework ON framework_mappings(framework_name);
CREATE INDEX IF NOT EXISTS idx_framework_mappings_state ON framework_mappings(current_state);

CREATE INDEX IF NOT EXISTS idx_generated_artifacts_assessment_id ON generated_artifacts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_generated_artifacts_type ON generated_artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_generated_artifacts_generated_at ON generated_artifacts(generated_at);

CREATE INDEX IF NOT EXISTS idx_approval_workflows_artifact_id ON approval_workflows(artifact_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(status);

CREATE INDEX IF NOT EXISTS idx_monthly_deliverables_assessment_id ON monthly_deliverables(assessment_id);
CREATE INDEX IF NOT EXISTS idx_monthly_deliverables_month_year ON monthly_deliverables(month_year);
CREATE INDEX IF NOT EXISTS idx_monthly_deliverables_status ON monthly_deliverables(status);

CREATE INDEX IF NOT EXISTS idx_subscription_value_assessment_id ON subscription_value_metrics(assessment_id);
CREATE INDEX IF NOT EXISTS idx_subscription_value_month_year ON subscription_value_metrics(month_year);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_uploads_updated_at BEFORE UPDATE ON document_uploads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_generated_artifacts_updated_at BEFORE UPDATE ON generated_artifacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_monthly_deliverables_updated_at BEFORE UPDATE ON monthly_deliverables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscription_value_metrics_updated_at BEFORE UPDATE ON subscription_value_metrics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

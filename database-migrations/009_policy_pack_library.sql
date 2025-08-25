-- Policy Pack Library Database Schema
-- Maintained templates with monthly redlines and external reference tracking

-- Policy templates table
CREATE TABLE IF NOT EXISTS policy_templates (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('governance', 'teaching', 'privacy', 'state', 'communications', 'syllabus')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd', 'Both')),
  
  -- External reference anchoring
  source_authority TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_document TEXT NOT NULL,
  last_source_update DATE NOT NULL,
  source_checksum TEXT, -- For automated change detection
  
  -- Template content
  template_content TEXT NOT NULL,
  fillable_fields TEXT[], -- Array of field names for customization
  
  -- Versioning
  version TEXT NOT NULL DEFAULT '1.0',
  last_redline_update DATE NOT NULL,
  
  -- Compliance and implementation
  compliance_frameworks TEXT[] NOT NULL DEFAULT '{}',
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
  implementation_complexity TEXT NOT NULL CHECK (implementation_complexity IN ('Simple', 'Moderate', 'Complex')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'pending')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy changes tracking (redlines)
CREATE TABLE IF NOT EXISTS policy_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL REFERENCES policy_templates(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  change_date DATE NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('Source Update', 'Legal Requirement', 'Best Practice', 'User Feedback')),
  source_reference TEXT NOT NULL,
  summary TEXT NOT NULL,
  detailed_changes JSONB NOT NULL, -- Array of RedlineChange objects
  
  -- Approval workflow
  approval_status TEXT NOT NULL DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Impact assessment
  impact_level TEXT NOT NULL CHECK (impact_level IN ('Minor', 'Moderate', 'Major')),
  affected_institutions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy packs (generated collections)
CREATE TABLE IF NOT EXISTS policy_packs (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd')),
  institution_name TEXT NOT NULL,
  state TEXT NOT NULL,
  
  -- Selected policies and customizations
  selected_policies TEXT[] NOT NULL, -- Array of template IDs
  customizations JSONB NOT NULL DEFAULT '{}',
  
  -- State-specific additions
  state_addenda TEXT,
  state_guidance_version TEXT,
  
  -- Generation and delivery
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'Generated' CHECK (delivery_status IN ('Generated', 'Delivered', 'Reviewed', 'Implemented')),
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  
  -- Monthly updates
  next_redline_update DATE NOT NULL,
  auto_update_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication kits (generated materials)
CREATE TABLE IF NOT EXISTS communication_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_pack_id TEXT REFERENCES policy_packs(id) ON DELETE CASCADE,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd')),
  institution_name TEXT NOT NULL,
  
  -- Generated content
  parent_letter TEXT NOT NULL,
  student_guide TEXT NOT NULL,
  faq_content TEXT NOT NULL,
  
  -- Customization options
  branding_applied BOOLEAN DEFAULT FALSE,
  language_localization TEXT DEFAULT 'en',
  accessibility_features BOOLEAN DEFAULT TRUE,
  
  -- Delivery tracking
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  usage_tracking JSONB DEFAULT '{}', -- Track which components are used
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Syllabus language generators
CREATE TABLE IF NOT EXISTS syllabus_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd')),
  subject_area TEXT NOT NULL,
  ai_usage_mode TEXT NOT NULL CHECK (ai_usage_mode IN ('Allowed', 'Limited', 'Prohibited')),
  
  -- Generated content
  policy_language TEXT NOT NULL,
  academic_integrity_language TEXT NOT NULL,
  examples_included TEXT[],
  
  -- Customization
  grade_level TEXT, -- For K12
  course_level TEXT, -- For HigherEd (undergraduate, graduate)
  discipline_specific BOOLEAN DEFAULT FALSE,
  
  -- Usage tracking
  times_generated INTEGER DEFAULT 0,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Source monitoring (for automated updates)
CREATE TABLE IF NOT EXISTS source_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_authority TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_document TEXT NOT NULL,
  
  -- Monitoring configuration
  check_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (check_frequency IN ('weekly', 'monthly', 'quarterly')),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  last_change_detected_at TIMESTAMP WITH TIME ZONE,
  
  -- Change detection
  current_checksum TEXT,
  previous_checksum TEXT,
  change_detection_method TEXT DEFAULT 'checksum' CHECK (change_detection_method IN ('checksum', 'api', 'manual')),
  
  -- Notification settings
  notify_on_change BOOLEAN DEFAULT TRUE,
  notification_emails TEXT[],
  
  -- Related templates
  monitored_templates TEXT[], -- Array of template IDs that depend on this source
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- State guidance tracking
CREATE TABLE IF NOT EXISTS state_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd', 'Both')),
  
  -- Guidance content
  guidance_title TEXT NOT NULL,
  guidance_content TEXT NOT NULL,
  effective_date DATE,
  last_updated DATE NOT NULL,
  
  -- Source information
  source_agency TEXT NOT NULL,
  source_document_url TEXT,
  guidance_type TEXT CHECK (guidance_type IN ('Statute', 'Regulation', 'Guidance', 'Best Practice')),
  
  -- Integration status
  integrated_into_templates BOOLEAN DEFAULT FALSE,
  affected_template_ids TEXT[],
  
  -- Change tracking
  version TEXT DEFAULT '1.0',
  change_summary TEXT,
  supersedes_guidance_id UUID REFERENCES state_guidance(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(state, institution_type, guidance_title)
);

-- Monthly deliverable tracking
CREATE TABLE IF NOT EXISTS monthly_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL,
  delivery_month TEXT NOT NULL, -- Format: '2024-08'
  institution_type TEXT NOT NULL CHECK (institution_type IN ('K12', 'HigherEd')),
  
  -- Delivered content
  policy_updates INTEGER DEFAULT 0,
  new_templates INTEGER DEFAULT 0,
  redlines_applied INTEGER DEFAULT 0,
  communication_kits INTEGER DEFAULT 0,
  
  -- Source updates included
  source_updates JSONB DEFAULT '[]', -- Array of source update summaries
  compliance_changes JSONB DEFAULT '[]', -- Array of compliance requirement changes
  
  -- Delivery metrics
  delivery_date DATE NOT NULL,
  client_notification_sent BOOLEAN DEFAULT FALSE,
  client_acknowledgment_received BOOLEAN DEFAULT FALSE,
  implementation_support_provided BOOLEAN DEFAULT FALSE,
  
  -- Value metrics
  estimated_time_saved_hours DECIMAL(5,2),
  estimated_cost_avoided DECIMAL(10,2),
  policies_updated_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(assessment_id, delivery_month)
);

-- Subscription value tracking for policy packs
CREATE TABLE IF NOT EXISTS policy_pack_value_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL,
  month_year TEXT NOT NULL,
  
  -- Policy pack usage
  packs_generated INTEGER DEFAULT 0,
  templates_customized INTEGER DEFAULT 0,
  communication_kits_created INTEGER DEFAULT 0,
  syllabus_languages_generated INTEGER DEFAULT 0,
  
  -- Implementation tracking
  policies_board_approved INTEGER DEFAULT 0,
  staff_training_conducted BOOLEAN DEFAULT FALSE,
  parent_communications_sent BOOLEAN DEFAULT FALSE,
  student_education_completed BOOLEAN DEFAULT FALSE,
  
  -- Compliance value
  frameworks_addressed INTEGER DEFAULT 0,
  risk_assessments_completed INTEGER DEFAULT 0,
  vendor_agreements_updated INTEGER DEFAULT 0,
  audit_preparations_completed INTEGER DEFAULT 0,
  
  -- Time and cost savings
  policy_development_hours_saved DECIMAL(5,2) DEFAULT 0,
  legal_review_costs_avoided DECIMAL(10,2) DEFAULT 0,
  consultant_fees_avoided DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(assessment_id, month_year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_policy_templates_category ON policy_templates(category);
CREATE INDEX IF NOT EXISTS idx_policy_templates_institution_type ON policy_templates(institution_type);
CREATE INDEX IF NOT EXISTS idx_policy_templates_status ON policy_templates(status);
CREATE INDEX IF NOT EXISTS idx_policy_templates_source_authority ON policy_templates(source_authority);

CREATE INDEX IF NOT EXISTS idx_policy_changes_template_id ON policy_changes(template_id);
CREATE INDEX IF NOT EXISTS idx_policy_changes_approval_status ON policy_changes(approval_status);
CREATE INDEX IF NOT EXISTS idx_policy_changes_change_date ON policy_changes(change_date);
CREATE INDEX IF NOT EXISTS idx_policy_changes_impact_level ON policy_changes(impact_level);

CREATE INDEX IF NOT EXISTS idx_policy_packs_assessment_id ON policy_packs(assessment_id);
CREATE INDEX IF NOT EXISTS idx_policy_packs_institution_type ON policy_packs(institution_type);
CREATE INDEX IF NOT EXISTS idx_policy_packs_state ON policy_packs(state);
CREATE INDEX IF NOT EXISTS idx_policy_packs_delivery_status ON policy_packs(delivery_status);

CREATE INDEX IF NOT EXISTS idx_communication_kits_policy_pack_id ON communication_kits(policy_pack_id);
CREATE INDEX IF NOT EXISTS idx_communication_kits_institution_type ON communication_kits(institution_type);

CREATE INDEX IF NOT EXISTS idx_source_monitoring_source_authority ON source_monitoring(source_authority);
CREATE INDEX IF NOT EXISTS idx_source_monitoring_last_checked ON source_monitoring(last_checked_at);

CREATE INDEX IF NOT EXISTS idx_state_guidance_state ON state_guidance(state);
CREATE INDEX IF NOT EXISTS idx_state_guidance_institution_type ON state_guidance(institution_type);
CREATE INDEX IF NOT EXISTS idx_state_guidance_last_updated ON state_guidance(last_updated);

CREATE INDEX IF NOT EXISTS idx_monthly_deliverables_assessment_id ON monthly_deliverables(assessment_id);
CREATE INDEX IF NOT EXISTS idx_monthly_deliverables_delivery_month ON monthly_deliverables(delivery_month);

CREATE INDEX IF NOT EXISTS idx_policy_pack_value_assessment_id ON policy_pack_value_metrics(assessment_id);
CREATE INDEX IF NOT EXISTS idx_policy_pack_value_month_year ON policy_pack_value_metrics(month_year);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_policy_templates_updated_at BEFORE UPDATE ON policy_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_policy_changes_updated_at BEFORE UPDATE ON policy_changes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_policy_packs_updated_at BEFORE UPDATE ON policy_packs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_communication_kits_updated_at BEFORE UPDATE ON communication_kits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_source_monitoring_updated_at BEFORE UPDATE ON source_monitoring FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_state_guidance_updated_at BEFORE UPDATE ON state_guidance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_monthly_deliverables_updated_at BEFORE UPDATE ON monthly_deliverables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_policy_pack_value_metrics_updated_at BEFORE UPDATE ON policy_pack_value_metrics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert initial policy templates
INSERT INTO policy_templates (id, category, title, description, institution_type, source_authority, source_url, source_document, last_source_update, template_content, fillable_fields, compliance_frameworks, risk_level, implementation_complexity) VALUES
('ai-governance-charter', 'governance', 'AI Governance Charter', 'Comprehensive AI governance framework aligned to NIST AI RMF', 'Both', 'NIST', 'https://www.nist.gov/itl/ai-risk-management-framework', 'NIST AI Risk Management Framework (AI RMF 1.0)', '2024-01-15', 'Template content here...', ARRAY['institutionName', 'approverName', 'effectiveDate'], ARRAY['NIST AI RMF', 'ISO 27001', 'SOC 2'], 'High', 'Complex'),

('ai-vendor-tools-policy', 'governance', 'AI Use of Third-Party Tools', 'Vendor intake process and DPA clauses for AI tools', 'Both', 'NIST', 'https://www.nist.gov/itl/ai-risk-management-framework', 'NIST AI RMF - Third Party Risk Management', '2024-07-10', 'Template content here...', ARRAY['institutionName', 'effectiveDate', 'approverName'], ARRAY['NIST AI RMF', 'GDPR', 'CCPA'], 'High', 'Moderate'),

('teaching-learning-ai-guidelines', 'teaching', 'Teaching & Learning with AI Guidelines', 'U.S. Department of Education aligned AI in education guidelines', 'Both', 'U.S. Department of Education', 'https://www.ed.gov/news/press-releases/department-education-releases-report-artificial-intelligence-and-future-teaching-and-learning', 'Artificial Intelligence and the Future of Teaching and Learning', '2024-05-01', 'Template content here...', ARRAY['institutionName', 'effectiveDate', 'gradeLevel'], ARRAY['ED Guidelines', 'FERPA', 'IDEA'], 'Medium', 'Moderate'),

('ferpa-genai-considerations', 'privacy', 'FERPA Considerations for GenAI Use', 'Data handling guidelines for generative AI compliance with FERPA', 'Both', 'Teaching at JHU', 'https://teaching.jhu.edu/resources/technology/artificial-intelligence-guidance/', 'FERPA and AI: Privacy Considerations', '2024-06-15', 'Template content here...', ARRAY['institutionName', 'effectiveDate', 'privacyOfficer'], ARRAY['FERPA', 'GDPR', 'CCPA'], 'High', 'Complex'),

('coppa-k12-language', 'privacy', 'COPPA Language for K-12', 'Children''s Online Privacy Protection Act compliance for AI tools', 'K12', 'Federal Trade Commission', 'https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/childrens-online-privacy-protection-rule', 'Children''s Online Privacy Protection Rule (COPPA)', '2024-04-10', 'Template content here...', ARRAY['institutionName', 'effectiveDate', 'districtName'], ARRAY['COPPA', 'FERPA', 'State Privacy Laws'], 'High', 'Complex')
ON CONFLICT (id) DO NOTHING;

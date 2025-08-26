-- Assessment 2.0 Enhanced Data Model
-- Document-in, Policy-out pipeline with comprehensive tracking
-- Version: 2.0.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PREREQUISITE TABLES (if not exists)
-- =====================================================

-- Create institutions table (if not exists)
CREATE TABLE IF NOT EXISTS institutions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    headcount INTEGER,
    budget DECIMAL(15,2),
    depth_mode TEXT,
    owner_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    org_type TEXT
);

-- Create institution_memberships table (if not exists)
CREATE TABLE IF NOT EXISTS institution_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(institution_id, user_id)
);

-- Create indexes for institution_memberships
CREATE INDEX IF NOT EXISTS idx_institution_memberships_institution ON institution_memberships(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_memberships_user ON institution_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_institution_memberships_active ON institution_memberships(active);

-- =====================================================
-- CORE DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  storage_key TEXT NOT NULL,
  pii_flags JSONB DEFAULT '[]',
  ocr_text TEXT,
  sections JSONB DEFAULT '[]',
  framework_tags JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_document_status CHECK (status IN ('uploaded', 'processed', 'failed'))
);

-- Create indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_framework_tags ON documents USING GIN (framework_tags);

-- =====================================================
-- ASSESSMENTS TABLE WITH SCORING
-- =====================================================

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{
    "AIRIX": 0,
    "AIRS": 0,
    "AICS": 0,
    "AIMS": 0,
    "AIPS": 0,
    "AIBS": 0
  }',
  findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  evidence_doc_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for assessments table
CREATE INDEX IF NOT EXISTS idx_assessments_org ON assessments(org_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_scores ON assessments USING GIN (scores);

-- =====================================================
-- ARTIFACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  format VARCHAR(10) NOT NULL,
  storage_key TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_artifact_type CHECK (type IN ('gap-report', 'policy-redline', 'board-deck')),
  CONSTRAINT valid_artifact_format CHECK (format IN ('pdf', 'docx', 'pptx'))
);

-- Create indexes for artifacts table
CREATE INDEX IF NOT EXISTS idx_artifacts_org ON artifacts(org_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_assessment ON artifacts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_artifacts_created ON artifacts(created_at DESC);

-- =====================================================
-- DOCUMENT SECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS document_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  section_type VARCHAR(20) NOT NULL,
  heading TEXT,
  content TEXT NOT NULL,
  page_number INTEGER,
  position_start INTEGER,
  position_end INTEGER,
  confidence DECIMAL(3,2) DEFAULT 0.0,
  framework_mappings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_section_type CHECK (section_type IN (
    'governance', 'risk', 'instruction', 'assessment', 'data', 'vendor', 'accessibility'
  ))
);

-- Create indexes for document_sections table
CREATE INDEX IF NOT EXISTS idx_sections_document ON document_sections(document_id);
CREATE INDEX IF NOT EXISTS idx_sections_type ON document_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_sections_page ON document_sections(page_number);

-- =====================================================
-- PII DETECTION LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS pii_detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  pii_type VARCHAR(20) NOT NULL,
  detected_text TEXT NOT NULL,
  redacted_text TEXT NOT NULL,
  position_start INTEGER NOT NULL,
  position_end INTEGER NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for pii_detections table
CREATE INDEX IF NOT EXISTS idx_pii_document ON pii_detections(document_id);
CREATE INDEX IF NOT EXISTS idx_pii_type ON pii_detections(pii_type);
CREATE INDEX IF NOT EXISTS idx_pii_detected ON pii_detections(detected_at DESC);

-- =====================================================
-- FRAMEWORK SCORING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS framework_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  framework VARCHAR(10) NOT NULL,
  category VARCHAR(50) NOT NULL,
  control_id VARCHAR(20) NOT NULL,
  score DECIMAL(3,2) NOT NULL,
  evidence_doc_ids UUID[] DEFAULT '{}',
  rationale TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_framework CHECK (framework IN ('AIRIX', 'AIRS', 'AICS', 'AIMS', 'AIPS', 'AIBS')),
  UNIQUE(assessment_id, framework, control_id)
);

-- Create indexes for framework_scores table
CREATE INDEX IF NOT EXISTS idx_framework_scores_assessment ON framework_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_framework_scores_framework ON framework_scores(framework);
CREATE INDEX IF NOT EXISTS idx_framework_scores_score ON framework_scores(score DESC);

-- =====================================================
-- METRICS TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS assessment_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name VARCHAR(50) NOT NULL,
  metric_value BIGINT NOT NULL DEFAULT 0,
  labels JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for assessment_metrics table
CREATE INDEX IF NOT EXISTS idx_metrics_name ON assessment_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded ON assessment_metrics(recorded_at DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pii_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_scores ENABLE ROW LEVEL SECURITY;

-- Documents access policy
CREATE POLICY "Documents access by org membership" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM institution_memberships im
      WHERE im.institution_id = documents.org_id
      AND im.user_id = auth.uid()
      AND im.active = true
    )
  );

-- Assessments access policy
CREATE POLICY "Assessments access by org membership" ON assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM institution_memberships im
      WHERE im.institution_id = assessments.org_id
      AND im.user_id = auth.uid()
      AND im.active = true
    )
  );

-- Artifacts access policy
CREATE POLICY "Artifacts access by org membership" ON artifacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM institution_memberships im
      WHERE im.institution_id = artifacts.org_id
      AND im.user_id = auth.uid()
      AND im.active = true
    )
  );

-- Sections access policy (via document)
CREATE POLICY "Sections access by document ownership" ON document_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN institution_memberships im ON im.institution_id = d.org_id
      WHERE d.id = document_sections.document_id
      AND im.user_id = auth.uid()
      AND im.active = true
    )
  );

-- PII detections access policy (via document)
CREATE POLICY "PII access by document ownership" ON pii_detections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN institution_memberships im ON im.institution_id = d.org_id
      WHERE d.id = pii_detections.document_id
      AND im.user_id = auth.uid()
      AND im.active = true
    )
  );

-- Framework scores access policy (via assessment)
CREATE POLICY "Framework scores access by assessment ownership" ON framework_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN institution_memberships im ON im.institution_id = a.org_id
      WHERE a.id = framework_scores.assessment_id
      AND im.user_id = auth.uid()
      AND im.active = true
    )
  );

-- =====================================================
-- AUDIT TRIGGERS
-- =====================================================

-- Updated timestamp trigger for assessments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assessments_updated_at 
  BEFORE UPDATE ON assessments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL METRICS
-- =====================================================

INSERT INTO assessment_metrics (metric_name, metric_value, labels) VALUES
  ('documents_processed_total', 0, '{"type": "counter"}'),
  ('pii_hits_total', 0, '{"type": "counter"}'),
  ('assessments_completed_total', 0, '{"type": "counter"}'),
  ('artifacts_generated_total', 0, '{"type": "counter"}')
ON CONFLICT DO NOTHING;

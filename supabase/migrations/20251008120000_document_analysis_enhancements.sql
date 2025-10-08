-- Document analysis enhancements: expand analysis storage and link to blueprints

-- Extend document_analyses with richer insight fields
ALTER TABLE public.document_analyses
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS compliance_findings JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS budget_signals JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS blueprint_alignment JSONB DEFAULT '[]'::jsonb;

-- Ensure new jsonb columns have sensible defaults
UPDATE public.document_analyses
SET
    compliance_findings = COALESCE(compliance_findings, '[]'::jsonb),
    budget_signals = COALESCE(budget_signals, '[]'::jsonb),
    blueprint_alignment = COALESCE(blueprint_alignment, '[]'::jsonb)
WHERE TRUE;

-- Extend blueprints table to store aggregated document insights
ALTER TABLE public.blueprints
    ADD COLUMN IF NOT EXISTS document_insights JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS document_compliance JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS source_documents JSONB DEFAULT '[]'::jsonb;

UPDATE public.blueprints
SET
    document_insights = COALESCE(document_insights, '[]'::jsonb),
    document_compliance = COALESCE(document_compliance, '[]'::jsonb),
    source_documents = COALESCE(source_documents, '[]'::jsonb)
WHERE TRUE;

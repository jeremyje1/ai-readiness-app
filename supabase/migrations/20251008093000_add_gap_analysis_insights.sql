-- Add risk and NIST alignment columns to gap_analysis_results
ALTER TABLE public.gap_analysis_results
  ADD COLUMN IF NOT EXISTS risk_hotspots JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.gap_analysis_results
  ADD COLUMN IF NOT EXISTS nist_alignment JSONB DEFAULT '[]'::jsonb;

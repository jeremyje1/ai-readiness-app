-- Add policy recommendation storage to blueprints
ALTER TABLE public.blueprints
    ADD COLUMN IF NOT EXISTS recommended_policies JSONB DEFAULT '[]'::jsonb;

-- Ensure existing rows have an array value
UPDATE public.blueprints
SET recommended_policies = COALESCE(recommended_policies, '[]'::jsonb)
WHERE TRUE;

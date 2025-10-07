DO $$
BEGIN
	IF to_regclass('public.gap_analysis_results') IS NOT NULL THEN
		EXECUTE $ddl$ALTER TABLE public.gap_analysis_results
			ADD COLUMN IF NOT EXISTS govern_strengths TEXT[],
			ADD COLUMN IF NOT EXISTS govern_recommendations TEXT[],
			ADD COLUMN IF NOT EXISTS map_strengths TEXT[],
			ADD COLUMN IF NOT EXISTS map_recommendations TEXT[],
			ADD COLUMN IF NOT EXISTS measure_strengths TEXT[],
			ADD COLUMN IF NOT EXISTS measure_recommendations TEXT[],
			ADD COLUMN IF NOT EXISTS manage_strengths TEXT[],
			ADD COLUMN IF NOT EXISTS manage_recommendations TEXT[],
			ADD COLUMN IF NOT EXISTS priority_actions TEXT[];$ddl$;
	ELSE
		RAISE NOTICE 'Skipping text[] gap_analysis_results backfill: table not found.';
	END IF;
END $$;

DO $$
BEGIN
	IF to_regclass('public.streamlined_assessment_responses') IS NOT NULL THEN
		EXECUTE $ddl$ALTER TABLE public.streamlined_assessment_responses 
			ADD COLUMN IF NOT EXISTS responses JSONB,
			ADD COLUMN IF NOT EXISTS scores JSONB,
			ADD COLUMN IF NOT EXISTS readiness_level VARCHAR(50),
			ADD COLUMN IF NOT EXISTS ai_roadmap TEXT;$ddl$;

		EXECUTE $ddl$CREATE INDEX IF NOT EXISTS idx_assessment_readiness_level 
			ON public.streamlined_assessment_responses(readiness_level);$ddl$;

		EXECUTE $ddl$CREATE INDEX IF NOT EXISTS idx_assessment_completed 
			ON public.streamlined_assessment_responses(completed_at DESC);$ddl$;

		EXECUTE $ddl$COMMENT ON COLUMN public.streamlined_assessment_responses.responses IS 
			'JSONB object containing question_id: answer_value pairs for NIST assessment';$ddl$;

		EXECUTE $ddl$COMMENT ON COLUMN public.streamlined_assessment_responses.scores IS 
			'JSONB object containing calculated scores by category (GOVERN, MAP, MEASURE, MANAGE, OVERALL)';$ddl$;

		EXECUTE $ddl$COMMENT ON COLUMN public.streamlined_assessment_responses.readiness_level IS 
			'Overall readiness level: Beginning, Emerging, Developing, or Advanced';$ddl$;

		EXECUTE $ddl$COMMENT ON COLUMN public.streamlined_assessment_responses.ai_roadmap IS 
			'AI-generated 30/60/90 day implementation roadmap based on assessment results';$ddl$;
	ELSE
		RAISE NOTICE 'Skipping streamlined_assessment_responses enhancements: table not found.';
	END IF;
END $$;

DO $$
BEGIN
	IF to_regclass('public.gap_analysis_results') IS NOT NULL THEN
		EXECUTE $ddl$ALTER TABLE public.gap_analysis_results
			ADD COLUMN IF NOT EXISTS govern_strengths JSONB,
			ADD COLUMN IF NOT EXISTS govern_recommendations TEXT,
			ADD COLUMN IF NOT EXISTS map_strengths JSONB,
			ADD COLUMN IF NOT EXISTS map_recommendations TEXT,
			ADD COLUMN IF NOT EXISTS measure_strengths JSONB,
			ADD COLUMN IF NOT EXISTS measure_recommendations TEXT,
			ADD COLUMN IF NOT EXISTS manage_strengths JSONB,
			ADD COLUMN IF NOT EXISTS manage_recommendations TEXT,
			ADD COLUMN IF NOT EXISTS priority_actions JSONB;$ddl$;

		EXECUTE $ddl$CREATE UNIQUE INDEX IF NOT EXISTS idx_gap_analysis_user_id_unique 
			ON public.gap_analysis_results(user_id);$ddl$;

		EXECUTE $ddl$COMMENT ON COLUMN public.gap_analysis_results.govern_strengths IS 
			'TEXT[] array of strengths identified in the GOVERN category';$ddl$;
		EXECUTE $ddl$COMMENT ON COLUMN public.gap_analysis_results.govern_recommendations IS 
			'TEXT[] array of recommendations for improving GOVERN category scores';$ddl$;
		EXECUTE $ddl$COMMENT ON COLUMN public.gap_analysis_results.map_strengths IS 
			'TEXT[] array of strengths identified in the MAP category';$ddl$;
		EXECUTE $ddl$COMMENT ON COLUMN public.gap_analysis_results.map_recommendations IS 
			'TEXT[] array of recommendations for improving MAP category scores';$ddl$;
		EXECUTE $ddl$COMMENT ON COLUMN public.gap_analysis_results.measure_strengths IS 
			'TEXT[] array of strengths identified in the MEASURE category';$ddl$;
		EXECUTE $ddl$COMMENT ON COLUMN public.gap_analysis_results.measure_recommendations IS 
			'TEXT[] array of recommendations for improving MEASURE category scores';$ddl$;
		EXECUTE $ddl$COMMENT ON COLUMN public.gap_analysis_results.manage_strengths IS 
			'TEXT[] array of strengths identified in the MANAGE category';$ddl$;
		EXECUTE $ddl$COMMENT ON COLUMN public.gap_analysis_results.manage_recommendations IS 
			'TEXT[] array of recommendations for improving MANAGE category scores';$ddl$;
		EXECUTE $ddl$COMMENT ON COLUMN public.gap_analysis_results.priority_actions IS 
			'TEXT[] array of priority actions to take immediately';$ddl$;
	ELSE
		RAISE NOTICE 'Skipping JSON gap_analysis_results backfill: table not found.';
	END IF;
END $$;

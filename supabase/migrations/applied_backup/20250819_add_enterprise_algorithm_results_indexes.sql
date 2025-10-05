-- Migration: Add indexes & uniqueness for enterprise_algorithm_results
-- Rationale:
-- 1. user_id index => accelerate per-user dashboards & API lookups
-- 2. computed_at index => support chronological queries & pruning
-- 3. composite unique index => prevent duplicate rows for same (assessment_id, user_id, algorithm_version)
--    If historical recalculation is desired, bump algorithm_version or use a revision column instead.

-- Index on user_id
create index if not exists enterprise_algorithm_results_user_idx
  on public.enterprise_algorithm_results (user_id);

-- Index on computed_at (descending often helps recent-first queries; plain index is fine here)
create index if not exists enterprise_algorithm_results_computed_at_idx
  on public.enterprise_algorithm_results (computed_at);

-- Composite uniqueness to avoid silent duplicates.
-- NOTE: If you later allow multiple recalculations for same version, drop this and replace with a surrogate revision column.
create unique index if not exists enterprise_algorithm_results_assessment_user_version_uidx
  on public.enterprise_algorithm_results (assessment_id, user_id, algorithm_version);

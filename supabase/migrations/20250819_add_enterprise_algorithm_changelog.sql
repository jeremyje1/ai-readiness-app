-- Migration: Create enterprise_algorithm_changelog table to track algorithm suite versions
create table if not exists public.enterprise_algorithm_changelog (
  version text primary key,
  released_at timestamptz not null default now(),
  summary text not null,
  details jsonb,
  breaking_changes boolean default false
);

insert into public.enterprise_algorithm_changelog (version, summary, details, breaking_changes)
  values ('1.0.0', 'Initial enterprise algorithm suite release (DSCH, CRF, LEI, OCI, HOCI)', '{"factors":"Introduced factor-based scoring with normalization and inversion handling"}', false)
  on conflict (version) do nothing;

# Full Experience Checklist

This guide maps the promises on `marketing-page.html` / educationaiblueprint.com to concrete product behaviors so you can validate the end-to-end experience before a launch or demo.

## 1. Environment Setup

1. **Bootstrap the demo database**
   ```bash
   chmod +x scripts/bootstrap-full-experience.sh
   ./scripts/bootstrap-full-experience.sh
   ```
   _Creates a Postgres 15 container, loads the Supabase schema (auth + public), installs required auth helper functions, and seeds premium demo data._

2. **Point the app at the seeded database**
   ```bash
   export DATABASE_URL="postgresql://postgres:postgres@localhost:54329/postgres"
   pnpm dev
   ```

3. **Login hint**
   - Use Supabase magic-link or insert an auth session for `admin@educationaiblueprint.com`. This user owns the seeded premium organization (`Test Organization Inc`).

## 2. Feature Coverage Matrix

| Marketing Promise | Implementation Touchpoints | Validation Notes |
| --- | --- | --- |
| NIST AI RMF readiness assessment | `app/assessment`, tables `gap_analysis_results`, `ai_readiness_assessments` | Confirm form renders, submissions write to seeded DB; scores visible on dashboard. |
| Implementation blueprint with phases/tasks | `app/dashboard`, tables `blueprints`, `blueprint_phases`, `blueprint_tasks`, `team_members`, `implementation_phases`, `tasks` | Seed script populates exemplar phases & tasks—verify they show under the premium workspace. |
| Goal capture & department strategies | Columns on `blueprint_goals`, `blueprints`, dashboard UI cards | Update goals in UI; ensure persistence by checking DB rows. |
| Progress tracking & blockers | `blueprint_progress`, `tasks.status`, UI progress bars | Mark a task complete → progress recalculates. |
| Budget & ROI metrics | `roi_metrics`, `tasks` budget columns | Verify charts/tables use seeded values (see ROI cards). |
| Calendar of implementation events | `calendar_events` | Calendar or timeline widget should display 4 seeded events. |
| Collaboration & premium access controls | RLS policies on `team_members`, `user_payments`, `blueprints` | Confirm only premium users can read/write; try with anon session if possible. |
| Policy / resource library | `app/resources`, tables `ai_policy_templates`, `policy_update_notifications`, `approved_tools_catalog` | Verify 50+ templates seeded by `supabase/seeds/seed-policy-templates.sql` appear in the UI resource library. |
| Document analysis & uploads | `uploaded_documents`, `document_analyses` | Upload from UI and check entry created; seeded DB contains structure only. |

## 3. Acceptance Flow

1. Complete the readiness assessment (or load an assessment result) and confirm the dashboard updates maturity scores.
2. Navigate to the Blueprint module and review seeded phases, tasks, and milestones.
3. Check ROI metrics and funding panels for the seeded organization.
4. Visit the Team Management screen to validate team roster seeded by `insert-test-data.sql`.
5. Review the Resource Library to confirm the policy template catalog populated with 50+ entries.
6. Review calendar events in the implementation timeline.
7. Confirm RLS by accessing the same routes with a non-premium user (should receive `401/403`).
8. Trigger any AI generation workflow (if OpenAI keys configured) to ensure GPT-powered summaries still function.

## 4. Operational Reminders

- **Auth helper functions**: `supabase/migrations/20251007212000_create_auth_helper_functions.sql` must run before enabling RLS-intensive tables. The bootstrap script handles this automatically.
- **Insert data ordering**: `insert-test-data.sql` assumes a user exists (`admin@educationaiblueprint.com`). The bootstrap script inserts one by default; adjust if you sync with a real Supabase project.
- **Policy templates seed**: `supabase/seeds/seed-policy-templates.sql` can be rerun independently to refresh the catalog; titles are unique per education band to avoid duplicates.
- **CLI alternative**: To run the migrations against Supabase directly, use `supabase db reset` followed by `supabase db push`, then re-run the helper migration and test data file via the SQL editor.

## 5. Future Enhancements

- Automate auth session creation for local demo (e.g., via NextAuth route that returns a signed Supabase JWT).
- Add integration tests that walk through the assessment → blueprint → progress workflow and assert key UI elements.
- Extend the policy catalog with additional metadata (e.g., FERPA/IDEA alignment flags) and tie them to in-app recommendations.
- Consider running the bootstrap verification workflow (`verify-demo-database`) on a nightly schedule for early warning of migration drift.

Keep this checklist up to date as features evolve so that marketing claims and product reality stay tightly aligned.

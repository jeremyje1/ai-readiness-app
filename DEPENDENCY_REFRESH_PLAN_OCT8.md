# Dependency Refresh Plan — October 8, 2025

## Why now
- Vercel builds surfaced multiple npm deprecation warnings (`rimraf@3.x`, `glob@7.x`, `eslint@8.57.1`, legacy Supabase auth helpers).
- `npm audit` reported high-severity advisories for `axios` and `jspdf`, and a moderate advisory for `esbuild` that propagates through `vite`/`vitest`.
- Supabase recommends migrating off the deprecated auth-helper package to the newer `@supabase/ssr` helpers.

## Immediate changes (completed in this pass)
- Removed the legacy Supabase auth helper package and updated remaining imports to `@/lib/supabase/{server,client}` helpers backed by `@supabase/ssr`.
- Bumped `jspdf` to `^3.0.3`, the latest patch line that remediates GHSA-8mvj-3j78-4qmw.
- Ran `npm audit fix` to resolve the reachable `axios` advisory pulled in by other dependencies.
- Regenerated `package-lock.json` via `npm install` so the lock no longer references deprecated Supabase helpers.

## Outstanding upgrade tracks
1. **Test tooling (vitest/vite/esbuild)**
   - `npm audit` still flags the `esbuild` vulnerability (GHSA-67mh-4wv8-2f99).
   - Address by upgrading to `vitest@>=3.x`, `vite@>=5.4` (or the matching release train), and confirming compatibility with existing test helpers.
   - Action item: create a follow-up branch to bump `vitest`, `@vitest/ui`, and adjust config (breaking change expected).

2. **ESLint + Next.js lint rules**
   - Vercel install logs warn that `eslint@8.57.1` is EOL.
   - Next.js 15.5 currently ships with ESLint 9 compatibility behind feature flags—verify support and schedule upgrade to the latest `eslint` + `eslint-config-next` once confirmed.

3. **Legacy utilities**
   - Deprecation warnings for `rimraf@3`, `glob@7`, `inflight@1.0.6` stem from transitive dependencies (`cypress`, `husky`, and legacy tooling). Track upstream updates and plan a quarterly cleanup to drop them as new majors release.

4. **Supabase client usage**
   - With `@supabase/ssr` in place, audit any remaining references to the old helper patterns inside docs/scripts and remove them to prevent regression copy-paste.

## Next steps checklist
- [ ] Open a ticket to upgrade the test stack (`vitest`, `vite`, `esbuild`, `@vitest/ui`) and update test configs where needed.
- [ ] Validate ESLint 9 support in Next.js 15.5, then bump `eslint`, `eslint-config-next`, and related tooling.
- [ ] Re-run `npm audit` after each upgrade train and capture results.
- [ ] Add CI guard that fails on deprecated package warnings once upgrades land.

## Validation
- `npm audit` now reports only the esbuild-related moderate issues pending the vitest/vite upgrade.
- `npm run test -- --run` should continue to pass (see latest CI run from earlier today); rerun after each staged dependency bump.

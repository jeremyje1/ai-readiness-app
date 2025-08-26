## Summary
What changed and why (client value/artifact delivered)?

## Checklist
- [ ] ENGINEERING_PLAN.md updated
- [ ] Migrations + seeds + rollback
- [ ] API contracts documented in /docs/http/*.http
- [ ] Unit/integration/e2e tests added (screenshots attached)
- [ ] Telemetry added (logs/metrics/traces)
- [ ] Accessibility checks (labels, tab order, contrast)
- [ ] Feature flag + rollout/rollback plan
- [ ] Security/Privacy review (no PII to LLMs, secrets safe)

## Testing
- [ ] Manual testing completed
- [ ] Unit tests pass: `npm run test`
- [ ] E2E tests pass: `npm run cypress:run`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Linting passes: `npm run lint`

## Deployment
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Feature flags configured
- [ ] Rollback plan documented

## Security & Privacy
- [ ] No sensitive data exposed
- [ ] Authentication/authorization verified
- [ ] Input validation implemented
- [ ] SQL injection prevention verified

## Performance
- [ ] Performance impact assessed
- [ ] Database query optimization verified
- [ ] Caching strategy implemented where needed
- [ ] Bundle size impact minimal

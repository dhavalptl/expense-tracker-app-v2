# 08 — UX hardening + Playwright critical path

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 7

## What to build
Failed loads show full-page error + retry; empty states polished. Playwright covers the happy path (email → transactions → dashboard → budget) and one negative (unauthenticated access or invalid amount).

## Acceptance
- [ ] Error + retry pattern on critical data routes
- [ ] Playwright POM + happy path e2e green
- [ ] One negative e2e case green
- [ ] `npm run build` green
- [ ] Ready for code-review + security-review

## Blocked by
05 — History; 07 — Dashboard (full happy path)

## Verify
- [ ] `npm run test:e2e` (or script name from ticket 01)
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Full unit suite green

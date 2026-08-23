# 08 — UX hardening + Playwright critical path

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 7

## What to build
Failed loads show full-page error + retry; empty states polished. Playwright covers the happy path (email → transactions → dashboard → budget) and one negative (unauthenticated access or invalid amount).

## Acceptance
- [x] Error + retry via `defaultErrorComponent` (`RouteError`)
- [x] Playwright POM + happy path e2e green
- [x] One negative e2e case green (unauthenticated → `/sign-in`)
- [x] `npm run build` green
- [x] Ready for code-review + security-review

## Blocked by
05 — History; 07 — Dashboard

## Verify
- [x] `npm run test:e2e` — 2 passed
- [x] `npm run typecheck` — pass
- [x] `npm run build` — pass
- [x] `npm run test` — 43 passed

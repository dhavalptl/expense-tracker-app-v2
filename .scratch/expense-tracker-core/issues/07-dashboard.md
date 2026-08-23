# 07 — Financial dashboard overview

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 6

## What to build
Home dashboard shows this-month **income total**, **expense total**, **net**, **spend-by-category**, and **budget progress**. Empty states with CTAs when there is no data.

## Acceptance
- [ ] `getDashboardSummary` server seam returns the above for the session user (Asia/Kolkata month)
- [ ] Home route composes overview (not a dense desktop dashboard)
- [ ] Numbers match independent fixture math for a known dataset
- [ ] Tests at seams: summary aggregation; authz denial

## Blocked by
04 — Add transactions; 06 — Monthly budget

## Verify
- [ ] Focused Vitest for dashboard summary fixtures
- [ ] `npm run typecheck`
- [ ] Manual: three transactions → correct totals + category breakdown + budget bar

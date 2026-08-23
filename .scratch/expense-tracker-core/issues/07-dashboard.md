# 07 — Financial dashboard overview

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 6

## What to build
Home dashboard shows this-month **income total**, **expense total**, **net**, **spend-by-category**, and **budget progress**. Empty states with CTAs when there is no data.

## Acceptance
- [x] `getDashboardSummary` server seam returns the above for the session user (Asia/Kolkata month)
- [x] Home route composes overview (not a dense desktop dashboard)
- [x] Numbers match independent fixture math for a known dataset
- [x] Tests at seams: summary aggregation (empty + populated)

## Blocked by
04 — Add transactions; 06 — Monthly budget

## Verify
- [x] Focused Vitest for dashboard summary fixtures
- [x] `npm run typecheck`
- [x] `npm run build`

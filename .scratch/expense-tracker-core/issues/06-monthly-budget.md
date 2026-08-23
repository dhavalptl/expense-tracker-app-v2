# 06 — Monthly total budget limit

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 5

## What to build
User sets a **calendar-month total expense** cap (INR). `/budgets` shows progress and status `under` | `at` | `over`. Month range uses `Asia/Kolkata` via a single `currentMonthRange()` helper.

## Acceptance
- [x] Pure `budgetStatus(spentPaise, limitPaise)` with Vitest fixtures
- [x] Upsert/read monthly budget server fns; spent = sum of expenses in current month
- [x] `/budgets` UI: set limit, show progress + status
- [x] Tests at seams: status rules; month range; overview aggregation

## Blocked by
04 — Add transactions

## Verify
- [x] Focused Vitest for `budgetStatus` + month range + overview
- [x] `npm run typecheck`
- [x] `npm run build`

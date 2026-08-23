# 06 — Monthly total budget limit

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 5

## What to build
User sets a **calendar-month total expense** cap (INR). `/budgets` shows progress and status `under` | `at` | `over`. Month range uses `Asia/Kolkata` via a single `currentMonthRange()` helper.

## Acceptance
- [ ] Pure `budgetStatus(spentPaise, limitPaise)` with Vitest fixtures (independent expected status)
- [ ] Upsert/read monthly budget server fns; spent = sum of expenses in current month
- [ ] `/budgets` UI: set limit, show progress + status
- [ ] Tests at seams: status rules; month range; authz

## Blocked by
04 — Add transactions (needs expenses to compute spent; can stub spent in unit tests earlier)

## Verify
- [ ] Focused Vitest for `budgetStatus` + month range fixtures
- [ ] `npm run typecheck`
- [ ] Manual: set limit; status matches known spend

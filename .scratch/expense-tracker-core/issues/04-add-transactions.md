# 04 — Add expense & income (tracer complete)

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 3 ★

## What to build
Signed-in user logs an **expense** (INR → paise, required owned category, date, optional note) and an **income** (`type: income`, no custom category) from `/add`. UI waits for server confirm; amounts display as ₹.

## Acceptance
- [ ] `createExpense` / `createIncome` validated server fns; expense requires owned `categoryId`
- [ ] `/add` form (TanStack Form + shadcn); success returns to a sensible next screen
- [ ] Amounts stored as integer paise; displayed via `formatInr`
- [ ] Tests at seams: validation; ownership denial; create happy path
- [ ] Category delete-in-use can be proven with a created expense

## Blocked by
03 — Categories

## Verify
- [ ] Focused Vitest for transaction server seams
- [ ] `npm run typecheck`
- [ ] Manual: log expense + income; ₹ display correct

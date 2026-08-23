# 04 — Add expense & income (tracer complete)

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 3 ★

## What to build
Signed-in user logs an **expense** (INR → paise, required owned category, date, optional note) and an **income** (`type: income`, no custom category) from `/add`. UI waits for server confirm; amounts display as ₹.

## Acceptance
- [x] `createExpense` / `createIncome` validated server fns; expense requires owned `categoryId`
- [x] `/add` form (TanStack Form + shadcn); success navigates to `/history`
- [x] Amounts stored as integer paise; confirmed via `formatInr` in success path
- [x] Tests at seams: validation; ownership denial; create happy path
- [x] Category delete-in-use already proven in ticket 03 with a transaction row

## Blocked by
03 — Categories

## Verify
- [x] `npm run test` — 30 passed (transaction suite red first: missing module)
- [x] `npm run typecheck` — pass
- [x] `npm run build` — pass

# 03 — Expense categories: seeds + CRUD

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 2

## What to build
On first user create, seed expense categories (Food, Transport, Housing, Shopping, Utilities, Health, Other). Signed-in user can list/add/rename/delete categories on a mobile-friendly screen. Delete is blocked with a clear message if any transaction references the category.

## Acceptance
- [x] Seeds created exactly once per new user
- [x] Category list / create / rename / delete server fns with `userId` ownership checks
- [x] UI at `/categories` linked from Budgets; empty + inline errors
- [x] Delete-in-use returns a user-visible error (proven in unit test with a transaction row)
- [x] Tests at seams: seed on create; ownership; delete blocked when referenced

## Blocked by
02 — Email auth shell

## Verify
- [x] `npm run test` — 25 passed (category suite red first: missing module)
- [x] `npm run typecheck` — pass
- [x] `npm run build` — pass

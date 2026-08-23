# 03 — Expense categories: seeds + CRUD

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 2

## What to build
On first user create, seed expense categories (Food, Transport, Housing, Shopping, Utilities, Health, Other). Signed-in user can list/add/rename/delete categories on a mobile-friendly screen. Delete is blocked with a clear message if any transaction references the category.

## Acceptance
- [ ] Seeds created exactly once per new user
- [ ] Category list / create / rename / delete server fns with `userId` ownership checks
- [ ] UI reachable from app (e.g. `/categories` or from Budgets); empty + inline errors
- [ ] Delete-in-use returns a user-visible error (full proof after ticket 04 has transactions)
- [ ] Tests at seams: seed on create; ownership; delete blocked when referenced

## Blocked by
02 — Email auth shell

## Verify
- [ ] Focused Vitest for category server seams
- [ ] `npm run typecheck`
- [ ] Manual: see seeds; add custom category

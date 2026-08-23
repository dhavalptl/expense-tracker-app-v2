# 01 — Foundation: DB, money helpers, test tooling

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 0

## What to build
Project can typecheck and unit-test money helpers; SQLite + Drizzle schema exists for users/categories/transactions/budgets; `data/` gitignored; `.env.example` documents `SESSION_SECRET`. No user-facing feature yet beyond green tooling.

## Acceptance
- [x] Vitest (+ RTL as needed) and Playwright installed; `package.json` scripts for `test`, `typecheck`, and `test:e2e`
- [x] Drizzle + `better-sqlite3`; schema stubs for `users`, `categories`, `transactions`, `budgets`; DB file under `data/app.sqlite`
- [x] `formatInr(paise)` / `parseInrToPaise` with independent fixture expectations
- [x] Tests at seams: money format/parse pure functions
- [x] `npm run build` succeeds with `better-sqlite3` externalized for Nitro

## Blocked by
None

## Verify
- [x] `npm run typecheck` — pass
- [x] `npm run test -- src/lib/money.test.ts` — 9 passed (red first: missing `./money.ts`)
- [x] `npm run build` — pass
- [x] `createDb('data/app.sqlite')` smoke — ok

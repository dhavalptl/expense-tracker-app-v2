# Spec: Core expense tracker (mobile-first)

## Problem

A solo user needs a reliable place to log personal income and expenses in INR, organize them with custom categories, see history with search/filters, stay within budgets, and understand this-month spending at a glance — on a phone first — without banking integrations or complex auth yet.

## Solution

A TanStack Start web app where the user signs in with a unique email (dev-style session), manages expense categories, records expense and income transactions, browses/filterable history, sets budget limits, and views a dashboard with this-month totals, spend-by-category, and budget progress. A visible banner states that email-only auth is not production security.

## Objective

Enable one person to track personal cashflow daily/weekly on mobile. Success: a new user registers, logs three transactions, sees correct dashboard sums in under five minutes at mobile width, and budget status matches rules on a fixed fixture dataset.

## User stories

1. As a new user, I want to register/sign in with only my email, so that I can start tracking without passwords.
2. As a signed-in user, I want seeded default expense categories and the ability to add/rename/delete my own, so that expenses match how I think about spending.
3. As a signed-in user, I want to log an expense (amount INR, category, date, optional note) and an income entry, so that my cashflow is complete.
4. As a signed-in user, I want transaction history with search on note and filters (type, category, date range), so that I can find past entries quickly.
5. As a signed-in user, I want to set a budget limit (e.g. monthly total and/or per category) and see over/under status, so that I know if I am overspending.
6. As a signed-in user, I want a dashboard showing this-month income, expense, net, spend-by-category, and budget progress, so that I get an overview without opening every transaction.
7. As a signed-in user with no data yet, I want empty states with clear CTAs (add transaction / add category / set budget), so that I know what to do next.
8. As a signed-in user, when a load or save fails, I want inline field errors or a full-page error with retry, so that I can recover without guessing.
9. As any visitor hitting a protected route without a session, I want to be sent to sign-in, so that other users’ data is not exposed.
10. As a developer/demo user, I want a persistent “dev auth” banner, so that I remember this email-only gate is temporary before password/GitHub auth.

## Tech stack

| Layer | Choice | Installed / planned |
| --- | --- | --- |
| UI | React 19.2.x, TypeScript 6.x, Tailwind 4, shadcn/ui (radix-lyra) | Installed |
| App | TanStack Start 1.168.x + TanStack Router 1.170.x + Nitro 3 beta | Installed |
| Forms / validation | TanStack Form 1.33.x, Zod 4.4.x | Installed |
| Auth (v1) | Email upsert + httpOnly session cookie; no password/OAuth yet | **Not in repo — add** |
| DB | SQLite (server-side), ORM TBD (prefer Drizzle if approved) | **Not in repo — add** |
| Money | INR only; store integer **paise** (₹1 = 100 paise) | Decision |
| Tests | Vitest + RTL; Playwright e2e | **Not in repo — add** |

Auth and data libraries: none yet. Greenfield beyond the Start + shadcn shell (`src/routes`, `src/components/ui`).

## Commands

From current `package.json` (test/typecheck/e2e scripts to be added when tooling lands):

| Intent | Command |
| --- | --- |
| Dev | `npm run dev` (Vite on port 3000) |
| Build | `npm run build` |
| Preview | `npm run preview` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Check formatting | `npm run check` |
| Generate routes | `npm run generate-routes` |
| Typecheck (planned) | `npx tsc --noEmit` until a `typecheck` script exists |
| Unit (planned) | script from `package.json` once Vitest is added — do not invent names |
| E2E (planned) | script from `package.json` once Playwright is added |

## Structure

Reuse this repo’s layout:

- Routes: `src/routes/` (file routes; `__root.tsx` shell, feature routes under app layout)
- Shared UI: `src/components/ui/` (shadcn); feature UI in `src/components/`
- Lib / utils: `src/lib/` (`#/*` import alias)
- Server functions: colocate under `src/server/` or next to domain modules (e.g. `src/server/transactions.ts`) — pick one convention in plan; keep `createServerFn` as the public seam
- DB: server-only module (e.g. `src/server/db.ts`); never import from client components
- Vitest: colocated `*.test.ts(x)` beside seams or under `src/**/__tests__`
- Playwright: `e2e/` (POM) once added

Mobile IA: bottom nav — **Home (dashboard)** / **Add** / **History** / **Budgets** (or Categories nested under settings/history as planned). After login, primary logging action is always thumb-reachable; history is the default operational home for “what did I spend,” dashboard for overview.

## Code style

Match existing imports (`#/…`), file routes, and shadcn primitives:

```tsx
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const createExpenseInput = z.object({
  amountPaise: z.number().int().positive(),
  categoryId: z.string().min(1),
  date: z.string(), // ISO date YYYY-MM-DD
  note: z.string().max(500).optional(),
})

export const createExpense = createServerFn({ method: 'POST' })
  .inputValidator(createExpenseInput)
  .handler(async ({ data }) => {
    // session required; validate ownership; insert into SQLite; return DTO
    return { id: '…', …data }
  })
```

Client routes use `createFileRoute`, `#/components/ui/*`, and `cn` from `#/lib/utils.ts`.

## Testing decisions

- **Seams (highest public boundary):**
  - Server functions: `signInWithEmail`, session read/sign-out, category CRUD, `createExpense` / `createIncome` / update/delete transaction, list/search transactions, budget upsert/read, dashboard summary
  - Critical routes: `/sign-in`, app shell with bottom nav, `/` or `/dashboard`, add transaction, `/history`, `/budgets`
- **Unit/component:** Vitest + RTL — money formatting (paise ↔ ₹ display), budget over/under rules, filter query parsing; behavior not class names
- **HTTP `fetch` / third party:** MSW only if external HTTP appears; **not** for `createServerFn` bodies (fake repos in unit tests)
- **E2E:** Playwright — happy path (email sign-in → add categories if needed → 3 transactions → dashboard sums → set budget → over/under) + one negative (invalid amount or unauthenticated access)
- **Good test:** asserts external behavior with independent expected values (known paise fixtures → known ₹ strings and budget status)

## Implementation decisions

### Auth

- Unique email identifies the user; first visit upserts; subsequent visits with the same email resume that user when a valid session cookie exists.
- After successful email submit: set httpOnly session cookie; redirect into the app.
- No email send, OTP, or password in this drop.
- All privileged server functions require a valid session; object-level checks by `userId` (no IDOR).
- Persistent visible **dev auth** banner on authenticated layouts.
- Later (out of scope): email+password and/or GitHub.

### Money & domain

- Currency: **INR** only. Persist amounts as **integer paise**. Display with ₹ and standard Indian grouping where practical.
- Transaction `type`: `expense` | `income`.
- Expenses **require** a user-owned category. Income uses a fixed Income path (system category or `type=income` without custom income taxonomy).
- Categories: seed a small default expense set on registration; user CRUD for expense categories (block delete if in use, or reassign — decide in plan; prefer block-with-message for v1).
- Budgets: user can set limits (at least monthly total spend; per-category limits if they fit the same model without blocking the tracer). Progress = spent in period vs limit; status `under` | `at` | `over`.
- History URL state: search params for `q`, `type`, `categoryId`, `from`, `to` so filters are shareable/bookmarkable within the session.
- Mutations: wait for server confirm; **no optimistic UI** in v1.
- Empty / loading / error: empty CTAs; inline field errors; full-page error + retry on failed loads.

### Data

- Source of truth: server-side SQLite.
- Access only through validated server functions.
- Ask before adding ORM/driver packages and choosing file path vs embedded DB location for Nitro.

## Boundaries

- **Always:** validate at server functions; no secrets in client; tests at named seams; session authz on every privileged read/mutation
- **Ask first:** new deps (SQLite driver, Drizzle, Vitest, Playwright, session libs), auth model changes, new GitHub Actions, schema/data store, MSW in `npm run dev`
- **Never:** commit secrets; `dangerouslySetInnerHTML` with unsanitized input; skip failing tests; force-push; production deploy without human OK

## Out of scope

- Recurring expenses / templates / auto-posting
- Bank / Plaid sync
- Multi-currency / FX
- Shared households / multi-user ledgers
- Export / import
- Admin tools
- Rich multi-month trend charts (beyond this-month overview + category breakdown)
- Passwords, magic links, OAuth/GitHub
- Optimistic UI
- Multi-device sync as a product requirement (single SQLite deployment is enough)
- Desktop-only IA (desktop may stretch the same mobile-first UI)

## Success criteria

- [ ] User can register/sign in with a unique email and receive a session; banner visible when authenticated
- [ ] Unauthenticated access to app routes redirects to sign-in
- [ ] New user gets seeded expense categories and can CRUD custom expense categories
- [ ] User can create expense (category required) and income in INR; amounts stored as paise and displayed as ₹
- [ ] History lists transactions; `q` / type / category / date-range filters work via URL search params
- [ ] User can set a budget limit and see under/at/over consistent with fixture math
- [ ] Dashboard shows this-month income total, expense total, net, spend-by-category, and budget progress
- [ ] Empty states show CTAs; validation errors are inline; failed loads offer retry
- [ ] Vitest covers money formatting and budget status rules at pure seams; server-fn tests cover authz denial and create/list happy paths with a fake or test DB
- [ ] Playwright covers the critical happy path + one negative case
- [ ] Typecheck + unit + build green for the slice that ships

## Open questions

Resolved in `tasks/plan.md` (approved defaults):

1. Budget v1: **monthly total expense cap only** (per-category later).
2. SQLite: **Drizzle + better-sqlite3** (ask before install).
3. Session: **signed httpOnly cookie** (HMAC + `SESSION_SECRET`).
4. Seed categories: Food, Transport, Housing, Shopping, Utilities, Health, Other.
)
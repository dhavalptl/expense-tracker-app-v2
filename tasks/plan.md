# Plan: Core expense tracker (mobile-first)

## Overview

Ship a solo INR cashflow app on the existing TanStack Start + Nitro + shadcn shell: email-session auth, SQLite persistence, categories, expenses/income, filterable history, monthly budget limits, and a this-month dashboard — mobile-first with bottom nav. Work proceeds as **vertical slices** (domain → server fn → route → UI → tests), not layer cakes. Tracer bullet = auth + one expense create/list path end-to-end before expanding.

## Architecture decisions

| Decision | Rationale | Rejected |
| --- | --- | --- |
| **SQLite + Drizzle + `better-sqlite3`** (ask before install) | Fits Nitro/Node server functions; typed schema; local file DB for v1 | Raw SQL only (slower iteration); LibSQL/Turso (extra ops) until needed |
| **DB file** under `data/app.sqlite` (gitignored) + migrate on server boot | Simple local/dev story | In-memory only (loses data on restart) |
| **Server modules in `src/server/`** (`db.ts`, `auth.ts`, `categories.ts`, `transactions.ts`, `budgets.ts`, `dashboard.ts`) | Clear server-only boundary; `createServerFn` stays the public seam | Colocating fns inside route files (harder to unit-test) |
| **Signed httpOnly session cookie** carrying `userId` + expiry (HMAC with `SESSION_SECRET`) | No session table needed for v1; matches “type email → cookie”; users still in SQLite | Server session rows (more moving parts); JWT in localStorage (XSS risk) |
| **Budget v1 = calendar-month total expense cap only** | Unblocks tracer and Q6 success; per-category caps later | Per-category in same first PR (scope risk) |
| **Delete category blocked if any transaction references it** | Spec preference; simple message | Cascade/reassign (more UI) |
| **Income = `type: 'income'`**, no category required; expenses require user-owned category | Matches spec “fixed Income path” | Full income category taxonomy |
| **Seed categories** on first user create: Food, Transport, Housing, Shopping, Utilities, Health, Other | Sensible defaults | Empty categories (worse empty state) |
| **Money:** domain in **paise** (`number` int); display via `formatInr(paise)` | Avoid float errors | Decimal strings in DB |
| **History filters** as validated route search params (`q`, `type`, `categoryId`, `from`, `to`) | Bookmarkable; testable parse seam | Client-only filter state |
| **Vitest + Playwright added in foundation slice** with scripts wired in `package.json` | Spec requires seams; repo has none yet | Manual-only (rejected by grill) |
| **App layout** `_authenticated` route group: dev-auth banner + bottom nav (Home / Add / History / Budgets); Categories reachable from Budgets or a small “Manage categories” entry on Add/History | Thumb-first IA from grill | Desktop sidebar-first |

**Resolved from spec open questions:** (1) monthly total only for v1 tracer, (2) Drizzle + better-sqlite3, (3) signed cookie session, (4) seed list above.

## Vertical slices

Ordered; each is demoable. Prefactors first.

### Slice 0 — Foundation (M)
- Add Vitest (+ RTL), Playwright, `typecheck` script; gitignore `data/`.
- Ask + add Drizzle, `better-sqlite3`, types; schema stubs: `users`, `categories`, `transactions`, `budgets`.
- `formatInr` / paise helpers + unit tests.
- **Demo:** unit script green on money helpers; `typecheck` script exists.

### Slice 1 — Tracer: email auth + session + shell (M)
- Zod email sign-in; upsert user; set signed cookie; `getSession` / `signOut`.
- `/sign-in` page; protect app routes (redirect if no session).
- Authenticated layout: **dev auth banner** + bottom nav scaffolding.
- Vitest: sign-in upsert + authz denial without cookie (fake/test DB).
- **Demo:** type email → land in empty app shell with banner.

### Slice 2 — Categories CRUD + seeds (S–M)
- On user create, insert seed expense categories.
- Server fns: list / create / rename / delete (block if in use).
- Minimal mobile UI (from Budgets or dedicated `/categories`).
- Empty + inline errors.
- **Demo:** see seeds; add a custom category; delete blocked when in use (prove after Slice 3).

### Slice 3 — Add expense & income (tracer money path) (M) ★ tracer complete
- `createExpense` / `createIncome` (paise, date, note); expense requires `categoryId` owned by user.
- `/add` form (TanStack Form + shadcn); wait for server confirm.
- Vitest: validation + ownership checks.
- **Demo:** log expense + income; amounts show as ₹.

### Slice 4 — History list + search/filters (M)
- `listTransactions` with filters; `/history` + search-param schema.
- Empty state CTA → Add.
- Unit: search-param parse; server: filter combinations.
- **Demo:** filter by type/category/date; search note.

### Slice 5 — Monthly budget limit (M)
- Upsert/read monthly total expense budget (current calendar month; TZ documented in ticket — prefer `Asia/Kolkata`).
- Pure `budgetStatus(spentPaise, limitPaise)` → `under` \| `at` \| `over` + Vitest fixtures.
- `/budgets` UI: set limit, show progress.
- **Demo:** set limit; status matches fixture math.

### Slice 6 — Dashboard overview (M)
- `getDashboardSummary`: this-month income, expense, net, spend-by-category, budget progress.
- Home `/` (or `/dashboard`) composed view; empty CTAs.
- **Demo:** three transactions → correct totals + category breakdown + budget bar.

### Slice 7 — Hardening UX + e2e (M)
- Full-page error + retry on failed loads; polish empty states.
- Playwright: happy path (sign-in → transactions → dashboard → budget) + one negative (unauthenticated or invalid amount).
- **Demo:** e2e green on critical path.

**Out of slice plan (later drops):** recurring, per-category budgets, password/GitHub auth, multi-currency, export.

## Risks

| Risk | Mitigation | Detect |
| --- | --- | --- |
| Nitro + `better-sqlite3` native binding / deploy mismatch | Confirm in Slice 0 on `npm run dev` + `build`; document Node requirement; fallback LibSQL if blocked | Dev boot / CI build failure |
| Email-only auth abused on public URL | Dev banner; document risk; optional allowlist later | Security review |
| Cookie secret missing in env | Fail fast on boot if `SESSION_SECRET` unset in non-dev; `.env.example` | Startup error |
| Timezone skew on “this month” | Document TZ in budget/dashboard tickets; single helper `currentMonthRange()` | Fixture tests at month boundaries |
| Scope creep (per-category budgets, recurring) | Plan explicitly defers; tickets reference spec out-of-scope | Review vs spec |
| Large history lists | v1 cap (e.g. 100) + date filter; no infinite scroll yet | Manual / e2e |

## Parallel vs sequential

- **Sequential:** Slice 0 → 1 → 2 → 3 (tracer). Then 4 and 5 can proceed in parallel after 3 (both need transactions). Slice 6 needs 3 + 5. Slice 7 last.
- **Parallel after Slice 3:** Agent A = History (4); Agent B = Budgets pure rules + UI (5).
- **Do not parallelize** schema migrations with feature slices without a single owner of `src/server/db` schema.

## Checkpoints

- After **Slice 0–1:** typecheck + Vitest; human OK on auth UX / banner copy.
- After **Slice 3 (tracer):** typecheck + Vitest; human demo of email → add expense/income; optional pause before history/budgets.
- After **Slice 5–6:** typecheck + Vitest; human OK on dashboard/budget numbers.
- After **Slice 7:** Playwright + build; code-review + security-review; draft PR linking `specs/expense-tracker-core.md` and parent issue.

## Post-drop addendum (ops / not original scope)

After Slice 7, preview/Nitro (`NODE_ENV=production`) failed without env, and SQLite needed an explicit prod path. This was **not** in the grilled product drop; treat as ops hardening:

| Decision | Rationale |
| --- | --- |
| Require `SESSION_SECRET` + `DATABASE_PATH` in production | Fail fast; no insecure defaults / accidental cwd DB on prod |
| Write-probe DB directory + WAL/`busy_timeout` | Catch read-only volumes early; single-node durable file SQLite |
| `npm run db:backup` | Online backup without stopping the server |
| `preview`/`start` use `--env-file=.env` | Local production-like runs load secrets without platform env |

Ticket: **09** in `tasks/todo.md` / `.scratch/.../09-sqlite-prod-env.md`.

## Parent tracking

- Spec: `specs/expense-tracker-core.md` (includes post-drop addendum)
- Tickets index: `tasks/todo.md`
- Bodies: `.scratch/expense-tracker-core/issues/01`–`09`
- No GitHub parent issue (local tracking only)

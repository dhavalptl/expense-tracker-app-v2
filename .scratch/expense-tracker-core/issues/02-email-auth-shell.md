# 02 — Email sign-in, session cookie, authenticated shell

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 1

## What to build
User types a unique email, gets an httpOnly signed session, lands in the app with a visible **dev auth** banner and bottom nav scaffolding. Unauthenticated visits to app routes go to `/sign-in`. Sign-out clears the session.

## Acceptance
- [x] `signInWithEmail` upserts user by email; sets signed httpOnly cookie (`SESSION_SECRET`)
- [x] `getSession` / `signOut` / `requireSession` server seams; privileged paths require session
- [x] `/sign-in` UI; protected `_authenticated` layout with banner + bottom nav (Home / Add / History / Budgets)
- [x] Tests at seams: sign-in upsert; authz denial without cookie; seal/unseal
- [x] Banner copy states this is not production security

## Blocked by
01 — Foundation

## Verify
- [x] `npm run test -- src/server/auth/session.test.ts` — 9 passed (red first: missing module)
- [x] `npm run test` — 18 passed
- [x] `npm run typecheck` — pass
- [x] `npm run build` — pass
- [ ] Manual browser smoke deferred (dev watcher hit EMFILE in this environment)

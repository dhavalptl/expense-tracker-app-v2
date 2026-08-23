# 02 — Email sign-in, session cookie, authenticated shell

## Parent
`specs/expense-tracker-core.md` · `tasks/plan.md` Slice 1

## What to build
User types a unique email, gets an httpOnly signed session, lands in the app with a visible **dev auth** banner and bottom nav scaffolding. Unauthenticated visits to app routes go to `/sign-in`. Sign-out clears the session.

## Acceptance
- [ ] `signInWithEmail` upserts user by email; sets signed httpOnly cookie (`SESSION_SECRET`)
- [ ] `getSession` / `signOut` server seams; privileged paths require session
- [ ] `/sign-in` UI; protected layout with banner + bottom nav (Home / Add / History / Budgets)
- [ ] Tests at seams: sign-in upsert; authz denial without cookie
- [ ] Banner copy states this is not production security

## Blocked by
01 — Foundation

## Verify
- [ ] Focused Vitest for auth server seams
- [ ] `npm run typecheck`
- [ ] Manual: email → shell with banner

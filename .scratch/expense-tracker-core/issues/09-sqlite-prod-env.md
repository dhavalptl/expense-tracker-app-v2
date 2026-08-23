# 09 — SQLite prod readiness + env for preview/prod (addendum)

## Parent
`specs/expense-tracker-core.md` · **Post-drop addendum** (not in original grill / plan slices 0–7)

## Why this exists
Added after tickets 01–08. Preview/Nitro run with `NODE_ENV=production` and failed without `SESSION_SECRET`; production also needed an explicit persistent `DATABASE_PATH` and backup path. This is **ops hardening**, not a product feature from the grill.

## What to build
- Fail fast in production if `SESSION_SECRET` or `DATABASE_PATH` missing
- Writable DB directory probe; SQLite WAL / foreign_keys / busy_timeout
- `.env` / `.env.example`; `preview` + `start` load via `node --env-file=.env`
- `npm run db:backup`; README production checklist
- Playwright webServer supplies secrets and does not reuse `dev` (avoids false greens)

## Acceptance
- [x] Production without env fails with clear errors
- [x] Preview/start work with `.env` containing `SESSION_SECRET` + `DATABASE_PATH`
- [x] Backup script writes a copy under `backups/` (or custom dir)
- [x] Spec/plan/todo document this as post-drop addendum
- [x] Unit tests for env resolution; e2e still green

## Blocked by
08 — UX + Playwright (feature drop complete first)

## Verify
- [x] `npm run test` / `typecheck`
- [x] `npm run test:e2e`
- [x] `npm run db:backup` (when DB file exists)

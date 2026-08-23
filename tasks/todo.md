# Todo: Core expense tracker

Parent: [`specs/expense-tracker-core.md`](../specs/expense-tracker-core.md) · Plan: [`tasks/plan.md`](plan.md)

Local tickets (no GitHub issues). Implement only the **frontier** (blockers done).

| ID | Title | Blocked by | Status |
| --- | --- | --- | --- |
| 01 | [Foundation](.scratch/expense-tracker-core/issues/01-foundation.md) | — | done |
| 02 | [Email auth + shell](.scratch/expense-tracker-core/issues/02-email-auth-shell.md) | 01 | done |
| 03 | [Categories seeds + CRUD](.scratch/expense-tracker-core/issues/03-categories.md) | 02 | done |
| 04 | [Add expense & income](.scratch/expense-tracker-core/issues/04-add-transactions.md) ★ tracer | 03 | done |
| 05 | [History search & filters](.scratch/expense-tracker-core/issues/05-history-filters.md) | 04 | done |
| 06 | [Monthly budget](.scratch/expense-tracker-core/issues/06-monthly-budget.md) | 04 | done |
| 07 | [Dashboard overview](.scratch/expense-tracker-core/issues/07-dashboard.md) | 04, 06 | done |
| 08 | [UX + Playwright e2e](.scratch/expense-tracker-core/issues/08-e2e-hardening.md) | 05, 07 | done |

**Frontier now:** none — feature drop complete. Next: code-review + security-review, then draft PR if asked.

**Parallel after 04:** `05` and `06` may run together; then `07`; then `08`.

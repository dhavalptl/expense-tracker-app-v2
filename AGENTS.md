# Spec-driven frontend pack

Stack: React, TypeScript, TanStack Start, shadcn/ui, Vitest+RTL, Playwright, GitHub `gh`.

## Context budget

Always-on: this file + `.cursor/rules/sdd-frontend.mdc`. Then load **one phase skill**. Add **one layer skill** only if you are editing that layer. Delegate a role agent instead of stuffing extra skills into the parent.

Canonical bodies: `skills/<name>/SKILL.md`. After edits: `bash scripts/sync-skill-copies.sh && bash scripts/check-prod.sh`.

## Prod gates

No app code during Specify/Plan. Human OK after assumptions, spec, plan, tickets, merge, production deploy. One tracer-bullet slice. Tests at public seams.

Never: force-push, skip hooks, skip failing tests, commit secrets, `Fixes`/`Closes` on parent spec issues, non-draft PRs without being asked, production deploy without being asked.

## Dispatch

| When | Skill | Agent |
|---|---|---|
| Vague idea | `grill-requirements` | `product-engineer` |
| Spec | `write-spec` | `product-engineer` |
| Plan | `write-plan` | `planner` |
| Tickets | `write-tickets` | `planner` |
| Code a ticket | `implement-slice` + `tdd-vitest` | `implementer` |
| Routes/server fns | `tanstack-start` | `implementer` |
| Types/components | `react-typescript` | `implementer` |
| shadcn | `shadcn-ui` | `implementer` |
| A11y/visual | `frontend-ui` | `implementer` |
| Unit tests | `vitest-rtl` | `test-engineer` |
| HTTP mocks (fetch/API/3rd party) | `msw-http` | `test-engineer` |
| E2E | `playwright-e2e` | `e2e-engineer` |
| Review | `code-review` | `code-reviewer` |
| Auth/input/secrets | `security-review` | `security-reviewer` |
| Issues/PRs | `github-gh` | `release-engineer` |
| CI/deploy | `deploy-ci` | `release-engineer` |
| Bug | `diagnose-bugs` | `implementer` |

Full lifecycle: `sdd-orchestrator`. Commands: read `package.json`, do not invent scripts.

## Slice done

Typecheck + focused Vitest green; Playwright if user-visible critical path; no Critical review/security; PR links spec/ticket.

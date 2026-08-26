---
name: sdd-orchestrator
description: Gated SDD for TanStack Start. Use when starting a feature or the user says spec, plan, build, test, review, or ship.
---

# SDD orchestrator

```
GRILL → SPEC → PLAN → TICKETS → SLICE (TDD) → UNIT → E2E → REVIEW → SECURITY → PR → DEPLOY
```

No app code until spec + current ticket are approved.

## Context budget

1. Read **this file** plus the **one** phase skill for the current step (`AGENTS.md` dispatch).
2. Add **one** layer skill only if this turn edits that layer.
3. Delegate a role agent for long work so the parent keeps a short summary.
4. Do not open the rest of the pack.

Specialist skills are named-only. You must `Read` them (or the agent will).

## Phase rules

1. Finish that skill's exit checklist before advancing.
2. Human OK after assumptions, spec, plan, tickets, merge, production deploy.
3. Tickets: `github-gh` if `gh auth status` works, else `tasks/todo.md`. PRs are **draft** until the human publishes. Deploy only after they ask.

## Commands

Use scripts from `package.json`. Typical: `dev`, `test` (Vitest), `test:e2e`, `typecheck`/`tsc --noEmit`, `build`, `gh pr checks`.

## Exit: feature done

- [ ] `specs/<slug>.md` matches shipped behavior
- [ ] Tickets evidenced (command + result)
- [ ] Typecheck + unit + build green; e2e on critical path
- [ ] No Critical `code-review` / `security-review`
- [ ] PR links spec; CI green; deploy only after human OK

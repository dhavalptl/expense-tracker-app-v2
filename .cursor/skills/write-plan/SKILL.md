---
name: write-plan
description: Writes tasks/plan.md from an approved spec. Use when planning slices, risks, or architecture. No application code.
disable-model-invocation: true
---

# Write plan

Read `specs/<slug>.md`. Stay read-only. Save `tasks/plan.md`.

## Dependency graph (Start-shaped)

Typical order inside **one** vertical slice:

```
domain types/zod
  → createServerFn / server route (authz + validation)
    → route loader / search params
      → page composed from shadcn
        → Vitest at the seam
          → Playwright for the user-visible path
```

Do not plan "all server functions, then all UI".

## Plan template

```markdown
# Plan: <name>

## Overview
One paragraph.

## Architecture decisions
- Decision → rationale → alternative rejected

## Vertical slices
Ordered. Each slice is demoable (one user-visible capability).

## Risks
Risk → mitigation → detect how

## Parallel vs sequential
What two agents could do at once vs what must wait.

## Checkpoints
After every 2–3 slices: typecheck, vitest, human review.
```

## Sizing

| Size | Files | Action |
|---|---|---|
| S | 1–2 | One ticket |
| M | 3–5 | One ticket |
| L+ | 6+ | Split |

Prefactors that unlock slices come first, as their own tickets.

## Exit

- [ ] Human approved the plan
- [ ] Risks named
- [ ] Slices are vertical
- [ ] Ready for `write-tickets`

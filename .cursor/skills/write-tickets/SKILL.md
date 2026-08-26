---
name: write-tickets
description: Publishes tracer-bullet tickets with blockers. Use when creating GitHub issues or tasks/todo.md.
disable-model-invocation: true
---

# Write tickets

Each ticket is a **tracer bullet**: a narrow complete path (types + server + UI + tests), demoable alone, sized for one context window.

## Draft

From spec + `tasks/plan.md` + repo patterns. Prefactor tickets first.

For each ticket list:

- Title
- Blocked by
- What it delivers (user-visible behavior)
- Acceptance checkboxes
- Verify commands (focused vitest / playwright / tsc)

## Quiz, then publish

Ask: granularity, blockers, merge/split. Iterate until approved.

**Publish (pick one):**

1. **GitHub** (`gh` authenticated): create issues in blocker-first order. Body uses the template. Link blockers in the body (`Blocked by #n`). Label `ready-for-agent` if the repo has it, else skip labels rather than inventing a taxonomy.
2. **Local:** `.scratch/<slug>/issues/01-<slug>.md` plus an index in `tasks/todo.md`.

Do not close the parent spec issue. Link with `Refs #n`, never `Fixes`/`Closes`.

## Issue body

```markdown
## Parent
<link to spec issue or specs/file>

## What to build
End-to-end behavior from the user's perspective.

## Acceptance
- [ ] …
- [ ] Tests at seams: <name the seams>

## Blocked by
None, or #ids

## Verify
- [ ] <package test command for this slice>
- [ ] <e2e command if UI-visible>
```

Avoid file-path inventories. Inline a type/schema snippet only when it *is* the decision.

## Wide refactors

If one rename would break the tree, use expand → migrate batches → contract, each a ticket, CI green after each batch.

## Work order

Implement only the **frontier**: tickets whose blockers are done.

## Exit

- [ ] Human approved breakdown
- [ ] Issues exist with acceptance + verify
- [ ] Index of ids lives in `tasks/plan.md`

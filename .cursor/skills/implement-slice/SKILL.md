---
name: implement-slice
description: Lands one approved ticket as a vertical slice. Use when implementing a tracer-bullet issue with TDD.
disable-model-invocation: true
---

# Implement slice

Implement **one** ticket. Touch only what it requires. Leave the tree compiling.

## Loop

```
read ticket + spec section
  → confirm seams with tdd-vitest
    → red → green (minimal)
      → typecheck + focused tests
        → commit
          → stop (next ticket is a new loop)
```

Load **at most one** layer skill this turn (`tanstack-start` XOR `react-typescript` XOR `shadcn-ui` XOR `frontend-ui`). Copy a neighbor file in that layer before inventing a new API.

## Simplicity

Ship the obvious correct version. Three similar lines beat a speculative abstraction. Note out-of-scope nits; do not "clean up" adjacent files.

## Vertical, not layered

One capability through the stack, e.g. "signed-in user creates a todo":

1. Zod input + `createServerFn` (authz on the server)
2. Route form / mutation
3. shadcn fields, loading/error/empty
4. Vitest at the seam: domain/server fn **or** `msw-http` if the UI talks HTTP
5. Playwright only if this slice is a critical user path and no e2e covers it yet

## Keep green

After the slice: repo typecheck, focused Vitest, existing tests still pass. Incomplete UI stays behind a flag or unlinked route rather than a broken main path.

## Commit

One logical change per commit. Message: why, plus `Refs #n`.

Then run `code-review` (or delegate `code-reviewer`) on the diff vs the ticket's base.

## Exit

- [ ] Acceptance boxes on the ticket are evidenced
- [ ] No extra features
- [ ] Tests at the agreed seams went red first

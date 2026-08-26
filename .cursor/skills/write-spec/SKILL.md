---
name: write-spec
description: Writes specs/<slug>.md for a Start feature. Use after grilling or when synthesizing a spec. Do not interview if asked only to synthesize.
disable-model-invocation: true
---

# Write spec

If the user said "just write the spec", synthesize; do not grill. Otherwise finish `grill-requirements` first.

Explore the repo enough to reuse existing modules and domain words. Prefer existing test seams over new ones.

Save to `specs/<slug>.md`. Offer to publish a parent GitHub issue via `github-gh`.

## Template

```markdown
# Spec: <name>

## Problem
From the user's point of view.

## Solution
From the user's point of view. What they can do when this ships.

## Objective
Who, why, success in one paragraph.

## User stories
Numbered: As a <actor>, I want <capability>, so that <benefit>.
Cover happy path, empty, error, permission denied, and one admin/power case if relevant.

## Tech stack
React, TypeScript, TanStack Start, shadcn/ui, Vitest+RTL, Playwright, GitHub.
Record versions from package.json. Note auth and data libraries already in the repo.

## Commands
Dev / test / typecheck / build / e2e — full commands from package.json.

## Structure
Where routes, server functions, components, Vitest files, and e2e live in THIS repo.

## Code style
One real snippet in the project's style (imports, naming, server vs client).

## Testing decisions
- Seams (highest public boundary): e.g. server function `createTodo`, HTTP `/api/todos`, route `/todos`
- Unit/component: Vitest + RTL (behavior, not class names)
- HTTP `fetch` / third party: MSW (`msw-http`); not for `createServerFn` bodies
- E2E: Playwright critical path + one negative case (real server, not MSW)
- What a good test is: external behavior, independent expected values

## Implementation decisions
Modules and interfaces, contracts, auth rules, URL/search-param state.
No file-path laundry lists (they go stale). Types/state machines may be inlined if they encode the decision.

## Boundaries
- Always: validate at server functions; no secrets in client; tests at named seams
- Ask first: new deps, auth changes, new GitHub Actions, schema/data store, MSW in `pnpm dev`
- Never: commit secrets; `dangerouslySetInnerHTML` with unsanitized input; skip failing tests

## Out of scope

## Success criteria
Checkbox, testable statements.

## Open questions
Only unresolved items.
```

## Exit

- [ ] Human approved the spec
- [ ] Success criteria are testable
- [ ] Seams named
- [ ] File committed or staged with the feature branch

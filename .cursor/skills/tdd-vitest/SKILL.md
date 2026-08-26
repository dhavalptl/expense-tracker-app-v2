---
name: tdd-vitest
description: Red-green Vitest TDD at agreed seams. Use when writing the failing test before production code.
disable-model-invocation: true
---

# TDD (Vitest)

Red → green only. Refactor is review (`code-review`), not this loop.

## Seams

Before the first test, name the **public seam** and confirm it:

- Server function / server route **domain** (fake repo)
- HTTP that the **client** calls (`fetch` / Query / `/api`) → `msw-http`
- Component's user-visible behavior (RTL; MSW if the component fetches HTTP)

Test at the highest seam that still gives fast, deterministic signal. Do not test private helpers or TanStack internals.

Discover the command from `package.json` (`vitest`, `vitest run path`, `--reporter=dot`). Never assume `npm test` exists.

## Good test

Reads like a spec. Asserts **state/output** users care about. Expected values are literals from the spec, not recomputed with the same algorithm as production (tautology).

## Anti-patterns to avoid by doing the opposite

- Test public behavior so refactors do not break tests
- One behavior per example; DAMP setup
- Prefer real code > fakes > stubs; mock network/time only
- Vertical: one failing test → minimal code → repeat (not a wall of tests first)

## Red

Write the example. Run it. **It must fail** for the right reason (missing export, wrong status, etc.). If it passes, it is not a test.

Colocate: `Foo.test.ts` next to `Foo.ts`, or follow the repo.

```ts
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('shows a validation message when title is empty', async () => {
  const user = userEvent.setup()
  render(<TodoForm onSubmit={vi.fn()} />)
  await user.click(screen.getByRole('button', { name: /add/i }))
  expect(await screen.findByText(/title is required/i)).toBeInTheDocument()
})
```

Query by role/label/text. Skip CSS class assertions.

## Green

Smallest change to pass. No extra parameters "for later".

## Bugs

Reproduce with a failing test first, then fix, then full suite once.

## Exit

- [ ] Red observed
- [ ] Green on focused file
- [ ] Names describe behavior

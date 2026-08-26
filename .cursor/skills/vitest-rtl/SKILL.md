---
name: vitest-rtl
description: Vitest + RTL tests at public seams. Use when writing unit or component tests.
disable-model-invocation: true
---

# Vitest + RTL

Discover config (`vitest.config.*`) and setup files. Use jsdom/happy-dom as the repo does.

## What to test here vs Playwright

| Layer | Tool |
|---|---|
| Domain, parsing, authz helpers | Vitest |
| Component behavior | RTL |
| Full browser + routing + cookies | Playwright (`playwright-e2e`) |

## RTL rules

- `render` with the same providers the app uses (router/query/theme). Extract a `renderWithApp` if the repo has one.
- Queries: `getByRole`, `getByLabelText`, `getByText`. `getByTestId` last.
- `await userEvent` for clicks/typing. `userEvent.setup()` per test.
- Assert text, roles, disabled, `aria-*`. Skip snapshots unless the repo already relies on them for a tiny fixture.

## Async

`findBy*` for appearance. Wrap state updates as RTL requires. Fake timers only when the component under test is timer-driven (`vi.useFakeTimers`).

## Server functions and HTTP

Prefer testing the **handler's domain function** with a fake repo. `createServerFn`: follow existing Start test helpers; do not mock the framework.

Client `fetch` / TanStack Query / `/api/*` / third-party HTTP: read `msw-http`. Do not `vi.mock('fetch')` when MSW can own the network seam.

## File names

Match neighbors: `*.test.ts(x)` or `*.spec.ts(x)`.

## Run

Focused: `vitest run src/path/Foo.test.tsx`. Full suite before you call the slice done.

## Exit

- [ ] Happy + one negative example
- [ ] Queries accessible
- [ ] No leaked timers/mocks (`vi.restoreAllMocks` in afterEach if the file mocks)

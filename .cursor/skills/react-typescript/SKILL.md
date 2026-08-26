---
name: react-typescript
description: Strict TypeScript React components and hooks. Use when typing props, unions, or client vs server components.
disable-model-invocation: true
---

# React + TypeScript

`strict` is on. Model domain data with unions and narrow; do not use `any`. Prefer `unknown` at boundaries then parse.

## Types

- Props: named `FooProps`. Export component types used by tests.
- Server/client shared types live in a types/domain module, not copied.
- Parse untrusted JSON with the schema used on the server; inferred types from that schema win.
- Exhaustive `switch` on discriminants (`never` in default).

## Components

- Function components. Colocate `Foo.tsx` + `Foo.test.tsx`.
- Split container (data, server fn, URL state) vs presentational list/item.
- Composition over mega-props. Children/slots beat `renderHeader` soup unless the repo already uses that.
- Derived values: compute during render. `useEffect` is for syncing with the world, not for copying props into state.

## State

Pick the lightest:

| Need | Tool |
|---|---|
| Local UI | `useState` |
| Shareable filters | route search params |
| Remote data | loader / Query already in repo |
| Rare global (theme, session) | existing context |

## Client vs server

Mark client files the way **this** Start version requires (existing files are the source of truth). Event handlers, `useState`, browser APIs stay in client components. Server components/fns stay pure of `window`.

## Hooks

Custom hooks for reuse of *behavior*, not to hide a single `useState`. Return stable, named fields.

## Performance

Keys from ids. Lists virtualize only when the repo already needs it or lists are huge. Memoize when a profiler or existing pattern shows a real cost — not by default.

## Exit

- [ ] `tsc --noEmit` (or repo typecheck) clean for the slice
- [ ] No `as any` without a comment pointing at a tracking ticket
- [ ] Errors and empty states typed, not implicit `null` soup

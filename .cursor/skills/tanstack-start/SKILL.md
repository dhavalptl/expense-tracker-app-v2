---
name: tanstack-start
description: TanStack Start routes, loaders, and createServerFn. Use when editing src/routes or server handlers.
disable-model-invocation: true
---

# TanStack Start

Accuracy comes from **this repo**, not from memory. Start's API moves; a wrong `createServerFn` shape is worse than a short skill.

## Before the first edit

1. Read `package.json` for `@tanstack/react-start` / router versions.
2. Copy the shape from the nearest existing route and server fn (imports, `createFileRoute`, loader, handler).
3. If the app is empty, fetch the Start guide for **that** version (or `node_modules` types). Do not mix Next.js or old Start snippets.

Then apply the rules below.

## Layout (typical)

```
src/routes/__root.tsx      # shell, head, error boundary
src/routes/index.tsx
src/routes/todos.index.tsx
src/routes/todos.$id.tsx
src/routes/api/*.ts        # HTTP API if the app uses server routes
src/router.tsx             # createTanStackRouter / start router
```

Use `createFileRoute` with the path the filename already encodes. Loaders fetch; components render. Keep serializable loader data.

## Server functions

- Default to `createServerFn` for type-safe mutations/queries used by the UI.
- Validate input with the project's schema lib (Zod, Valibot, ArkType) **on the server**.
- Enforce authz **inside the handler**, not only in the UI. Return 401/403-equivalent errors the client already handles.
- Use GET-safe functions for reads; POST/PUT/DELETE for mutations (follow existing helpers).
- Never import Node-only or secret-bearing modules into client components. Secrets stay in server-only files / env.

## Routes and URLs

- Filters, tabs, pagination: **search params** with validated types (`validateSearch`), not only `useState`.
- Nested layouts for chrome (sidebar) vs pages.
- `pendingComponent` / `errorComponent` on routes that load.

## HTTP vs server functions

Public HTTP (`src/routes/api`, webhooks): reuse the **same domain functions** as server fns. Client `fetch` / third parties: mock with `msw-http` in Vitest (optional dev worker only if the human asked). `createServerFn` / loaders: test the domain function; do not MSW Start's RPC URL.

## Data

Prefer Start loaders + server fns. If the repo already uses TanStack Query, keep that pattern for client cache; still mutate through server fns.

## Errors

Map thrown server errors to user-safe messages. Log details server-side. Do not leak stack traces to the client.

## Exit

- [ ] Types flow from server fn / loader into the page
- [ ] Authz on the server
- [ ] Search params validated
- [ ] No secret imports on the client

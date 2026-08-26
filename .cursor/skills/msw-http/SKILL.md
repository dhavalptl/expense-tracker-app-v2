---
name: msw-http
description: MSW handlers for HTTP APIs in Vitest and local UI. Use when mocking fetch, API routes, or third-party HTTP — not createServerFn.
disable-model-invocation: true
---

# MSW (mswjs)

MSW is the **HTTP seam**: intercept `fetch`/`XMLHttpRequest` with the same handlers in Node tests and (optionally) the browser. It is not a fake of TanStack Start internals.

## When to use

| Need | Tool |
|---|---|
| Client `fetch` / Query to `/api/*` or a third party | MSW `http.*` handlers |
| UI slice before the HTTP API exists | Same handlers in Vitest; optional browser worker in **dev only** |
| Domain / authz / `createServerFn` body | Fake repo + Vitest (`vitest-rtl`). Do not MSW the RPC URL |
| Critical user path in a real browser | Playwright against the real Start server (`playwright-e2e`) |

Ask before adding a browser worker to `pnpm dev` — production and Playwright stay on the real backend.

## Layout (match the repo if it already has MSW)

```
src/mocks/handlers.ts      # shared http handlers
src/mocks/server.ts        # setupServer for Vitest
src/mocks/browser.ts       # setupWorker — dev only, if the ticket says so
```

Use **MSW 2**: `http` + `HttpResponse` from `msw`. Copy imports from the installed `msw` types if they differ.

```ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const handlers = [
  http.get('/api/todos', () =>
    HttpResponse.json([{ id: '1', title: 'Buy milk' }]),
  ),
  http.post('/api/todos', async ({ request }) => {
    const body = await request.json()
    if (!body?.title) {
      return HttpResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    return HttpResponse.json({ id: '2', title: body.title }, { status: 201 })
  }),
]

export const server = setupServer(...handlers)
```

Vitest setup (or the repo's existing `setupFiles`):

```ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './src/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

`onUnhandledRequest: 'error'` so tests cannot silently hit the network. Override one test with `server.use(...)`.

## Rules

- Handlers describe **HTTP contracts** (method, path, status, JSON). Keep them aligned with the spec / OpenAPI.
- Paths match what the **client** calls (relative `/api/...` or full origin the app uses).
- Happy + 4xx/5xx handlers for the slice.
- Do not put secrets in handler fixtures.
- Do not intercept Start's internal server-fn endpoint unless the repo already does that and tests prove it.

## Exit

- [ ] Seam is HTTP (not a server fn body)
- [ ] Unhandled requests fail the test
- [ ] Playwright still uses the real app for the critical path

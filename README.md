# expense-tracker-app-v2

TanStack Start + Nitro expense tracker (INR, SQLite).

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000 — sign in with any email (dev auth).

## Production (Node + SQLite)

This app is designed for a **single long-running Node server** with a **persistent disk**.

1. Set environment variables (or `.env` loaded by `npm run start`):

```bash
SESSION_SECRET=<random-string-16+-chars>
DATABASE_PATH=/var/lib/expense-tracker/app.sqlite
```

2. Ensure `DATABASE_PATH` is on a **writable persistent volume** (not ephemeral container storage unless you accept data loss).

3. Build and run on the **same OS/CPU arch** as production (`better-sqlite3` is native):

```bash
npm run build
npm run start
```

4. Back up regularly (safe while the server is running):

```bash
npm run db:backup
# or
npm run db:backup -- /var/backups/expense-tracker
```

### SQLite production constraints

| Do | Don't |
| --- | --- |
| One Node writer process | Multi-instance / horizontal scale without shared DB |
| Persistent volume + backups | Serverless ephemeral filesystem |
| Match build OS to host for native modules | Copy Linux build to macOS host (or the reverse) |

For serverless or multi-region later, move off file SQLite (e.g. Turso/libSQL or Postgres).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build (`.output`) |
| `npm run preview` | Preview build with `.env` |
| `npm run start` | Run Nitro Node server with `.env` |
| `npm run db:backup` | Online SQLite backup |
| `npm run test` | Unit tests |
| `npm run test:e2e` | Playwright e2e |

## Deploy with Nitro

```bash
npm run build
npm run start
```

Output lives in `.output/`. Host-specific presets: https://v3.nitro.build/deploy

## Shadcn

```bash
npx shadcn@latest add button
```

import fs from 'node:fs'
import path from 'node:path'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import {
  assertProductionRuntimeConfig,
  assertWritableDatabaseLocation,
  resolveDatabasePath,
} from '../env.ts'
import * as schema from './schema.ts'

export function createDb(dbPath?: string) {
  const resolved = resolveDatabasePath(dbPath)
  assertWritableDatabaseLocation(resolved)

  const sqlite = new Database(resolved)
  // Single-node prod defaults: wait on locks, keep integrity, durable WAL.
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  sqlite.pragma('busy_timeout = 5000')
  sqlite.pragma('synchronous = NORMAL')

  const db = drizzle(sqlite, { schema })
  migrate(sqlite)
  return Object.assign(db, { sqlitePath: resolved })
}

/** Minimal SQL migrate for v1 — replace with drizzle-kit migrations later if needed. */
function migrate(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      amount_paise INTEGER NOT NULL,
      category_id TEXT REFERENCES categories(id),
      date TEXT NOT NULL,
      note TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      year_month TEXT NOT NULL,
      limit_paise INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_month
      ON budgets(user_id, year_month);
  `)
}

export type AppDb = ReturnType<typeof createDb>

let singleton: AppDb | undefined

export function getDb(): AppDb {
  assertProductionRuntimeConfig()
  if (!singleton) {
    singleton = createDb()
  }
  return singleton
}

export function getResolvedDatabasePath(): string {
  return resolveDatabasePath()
}

/** Online backup via SQLite backup API (safe while the app is running). */
export async function backupDatabaseTo(
  destinationPath: string,
  sourcePath?: string,
): Promise<string> {
  const resolvedSource = resolveDatabasePath(sourcePath)
  const resolvedDest = path.resolve(destinationPath)
  fs.mkdirSync(path.dirname(resolvedDest), { recursive: true })

  const source = new Database(resolvedSource, { readonly: true, fileMustExist: true })
  try {
    await source.backup(resolvedDest)
  } finally {
    source.close()
  }
  return resolvedDest
}

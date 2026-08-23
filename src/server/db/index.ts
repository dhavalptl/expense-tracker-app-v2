import fs from 'node:fs'
import path from 'node:path'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import * as schema from './schema.ts'

const defaultDbPath = path.join(process.cwd(), 'data', 'app.sqlite')

function ensureDataDir(dbPath: string) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
}

export function createDb(dbPath: string = process.env.DATABASE_PATH ?? defaultDbPath) {
  ensureDataDir(dbPath)
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  migrate(sqlite)
  return db
}

/** Minimal SQL migrate for v1 stubs — replace with drizzle-kit migrations in a later ticket if needed. */
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
  if (!singleton) {
    singleton = createDb()
  }
  return singleton
}

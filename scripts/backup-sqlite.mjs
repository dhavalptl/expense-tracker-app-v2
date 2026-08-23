#!/usr/bin/env node
/**
 * Online SQLite backup for production/local.
 *
 * Usage:
 *   npm run db:backup
 *   npm run db:backup -- /path/to/backups
 */
import fs from 'node:fs'
import path from 'node:path'

import Database from 'better-sqlite3'

const source =
  process.env.DATABASE_PATH?.trim() ||
  path.resolve(process.cwd(), 'data', 'app.sqlite')

const backupRoot = path.resolve(
  process.argv[2] || process.env.DATABASE_BACKUP_DIR || 'backups',
)

if (!fs.existsSync(source)) {
  console.error(`No database found at ${source}`)
  process.exit(1)
}

fs.mkdirSync(backupRoot, { recursive: true })
const stamp = new Date().toISOString().replaceAll(':', '').replaceAll('.', '-')
const dest = path.join(backupRoot, `app-${stamp}.sqlite`)

const db = new Database(source, { readonly: true, fileMustExist: true })
try {
  await db.backup(dest)
  console.log(`Backup written to ${dest}`)
} finally {
  db.close()
}

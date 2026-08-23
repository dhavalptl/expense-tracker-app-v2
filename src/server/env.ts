import fs from 'node:fs'
import path from 'node:path'

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim()
  if (secret && secret.length >= 16) {
    return secret
  }
  if (isProductionRuntime()) {
    throw new Error(
      'SESSION_SECRET must be set to a long random string (16+ chars) in production',
    )
  }
  return 'dev-insecure-session-secret'
}

const defaultRelativeDbPath = path.join('data', 'app.sqlite')

/**
 * Resolve the SQLite file path.
 * - Explicit `override` (tests) always wins.
 * - Production requires `DATABASE_PATH` on a persistent volume.
 * - Dev defaults to `<cwd>/data/app.sqlite`.
 */
export function resolveDatabasePath(override?: string): string {
  if (override) {
    return path.resolve(override)
  }

  const fromEnv = process.env.DATABASE_PATH?.trim()
  if (fromEnv) {
    return path.resolve(fromEnv)
  }

  if (isProductionRuntime()) {
    throw new Error(
      'DATABASE_PATH must be set in production to a persistent writable SQLite file (e.g. /var/lib/expense-tracker/app.sqlite)',
    )
  }

  return path.resolve(process.cwd(), defaultRelativeDbPath)
}

/** Ensure the DB directory exists and is writable before opening SQLite. */
export function assertWritableDatabaseLocation(dbPath: string): void {
  const dir = path.dirname(dbPath)
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (err) {
    throw new Error(
      `Cannot create database directory "${dir}": ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  try {
    fs.accessSync(dir, fs.constants.W_OK)
  } catch {
    throw new Error(
      `Database directory "${dir}" is not writable. Mount a persistent volume and set DATABASE_PATH.`,
    )
  }

  const probe = path.join(dir, `.write-probe-${process.pid}`)
  try {
    fs.writeFileSync(probe, 'ok')
    fs.unlinkSync(probe)
  } catch (err) {
    throw new Error(
      `Database directory "${dir}" failed a write probe: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

/** Fail fast on boot for production session + DB configuration. */
export function assertProductionRuntimeConfig(): void {
  requireSessionSecret()
  if (isProductionRuntime()) {
    const dbPath = resolveDatabasePath()
    assertWritableDatabaseLocation(dbPath)
  }
}

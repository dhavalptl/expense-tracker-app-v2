import { afterEach, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  assertWritableDatabaseLocation,
  isProductionRuntime,
  requireSessionSecret,
  resolveDatabasePath,
} from './env.ts'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env.NODE_ENV = originalEnv.NODE_ENV
  process.env.SESSION_SECRET = originalEnv.SESSION_SECRET
  process.env.DATABASE_PATH = originalEnv.DATABASE_PATH
})

describe('requireSessionSecret', () => {
  it('requires SESSION_SECRET in production', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.SESSION_SECRET
    expect(() => requireSessionSecret()).toThrow(/SESSION_SECRET/)
  })

  it('accepts a long secret in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.SESSION_SECRET = 'production-secret-16+'
    expect(requireSessionSecret()).toBe('production-secret-16+')
  })
})

describe('resolveDatabasePath', () => {
  it('requires DATABASE_PATH in production', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.DATABASE_PATH
    expect(() => resolveDatabasePath()).toThrow(/DATABASE_PATH/)
  })

  it('resolves DATABASE_PATH absolutely in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.DATABASE_PATH = 'data/prod.sqlite'
    expect(resolveDatabasePath()).toBe(path.resolve('data/prod.sqlite'))
  })

  it('allows an explicit override without env', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.DATABASE_PATH
    const override = path.join(os.tmpdir(), 'override.sqlite')
    expect(resolveDatabasePath(override)).toBe(path.resolve(override))
  })
})

describe('assertWritableDatabaseLocation', () => {
  it('creates a writable directory for the db file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'expense-db-'))
    const dbPath = path.join(dir, 'nested', 'app.sqlite')
    expect(() => assertWritableDatabaseLocation(dbPath)).not.toThrow()
    expect(fs.existsSync(path.dirname(dbPath))).toBe(true)
  })
})

describe('isProductionRuntime', () => {
  it('detects production NODE_ENV', () => {
    process.env.NODE_ENV = 'production'
    expect(isProductionRuntime()).toBe(true)
    process.env.NODE_ENV = 'development'
    expect(isProductionRuntime()).toBe(false)
  })
})

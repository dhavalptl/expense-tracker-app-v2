import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createDb, type AppDb } from '../db/index.ts'
import {
  AuthError,
  findUserById,
  requireSessionUser,
  sealSession,
  unsealSession,
  upsertUserByEmail,
} from './session.ts'

describe('upsertUserByEmail', () => {
  let dbPath: string
  let db: AppDb

  beforeEach(() => {
    dbPath = path.join(os.tmpdir(), `expense-auth-${Date.now()}-${Math.random()}.sqlite`)
    db = createDb(dbPath)
  })

  afterEach(() => {
    fs.rmSync(dbPath, { force: true })
    fs.rmSync(`${dbPath}-wal`, { force: true })
    fs.rmSync(`${dbPath}-shm`, { force: true })
  })

  it('creates a user for a new email', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    expect(user.email).toBe('ada@example.com')
    expect(user.id).toBeTruthy()
    expect(findUserById(db, user.id)?.email).toBe('ada@example.com')
  })

  it('returns the same user when email already exists', () => {
    const first = upsertUserByEmail(db, 'ada@example.com')
    const second = upsertUserByEmail(db, 'ada@example.com')
    expect(second.id).toBe(first.id)
  })

  it('normalizes email to lowercase trimmed', () => {
    const user = upsertUserByEmail(db, '  Ada@Example.COM ')
    expect(user.email).toBe('ada@example.com')
  })
})

describe('session token', () => {
  const secret = 'test-session-secret-at-least-32-chars'

  beforeEach(() => {
    process.env.SESSION_SECRET = secret
  })

  it('round-trips a sealed user id', () => {
    const token = sealSession('user-1')
    expect(unsealSession(token)).toEqual({ userId: 'user-1' })
  })

  it('rejects a tampered token', () => {
    const token = sealSession('user-1')
    expect(unsealSession(`${token}x`)).toBeNull()
  })

  it('rejects an expired token', () => {
    const token = sealSession('user-1', { maxAgeMs: -1 })
    expect(unsealSession(token)).toBeNull()
  })
})

describe('requireSessionUser', () => {
  let dbPath: string
  let db: AppDb

  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-session-secret-at-least-32-chars'
    dbPath = path.join(os.tmpdir(), `expense-auth-${Date.now()}-${Math.random()}.sqlite`)
    db = createDb(dbPath)
  })

  afterEach(() => {
    fs.rmSync(dbPath, { force: true })
    fs.rmSync(`${dbPath}-wal`, { force: true })
    fs.rmSync(`${dbPath}-shm`, { force: true })
  })

  it('returns the user for a valid session token', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const token = sealSession(user.id)
    expect(requireSessionUser(db, token)).toEqual(user)
  })

  it('throws Unauthorized when cookie is missing', () => {
    expect(() => requireSessionUser(db, undefined)).toThrow(AuthError)
    expect(() => requireSessionUser(db, undefined)).toThrow(/unauthorized/i)
  })

  it('throws Unauthorized when token is invalid', () => {
    expect(() => requireSessionUser(db, 'not-a-token')).toThrow(/unauthorized/i)
  })
})

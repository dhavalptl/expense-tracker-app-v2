import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

import { eq } from 'drizzle-orm'

import type { AppDb } from '../db/index.ts'
import { users } from '../db/schema.ts'
import { seedDefaultCategories } from '../categories/categories.ts'

export const SESSION_COOKIE = 'expense_session'
export const DEFAULT_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'AuthError'
  }
}

export type SessionUser = {
  id: string
  email: string
  createdAt: Date
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (secret && secret.length >= 16) {
    return secret
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set to a long random string in production')
  }
  return 'dev-insecure-session-secret'
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) {
    return false
  }
  return timingSafeEqual(aBuf, bBuf)
}

export function sealSession(
  userId: string,
  options: { maxAgeMs?: number; now?: number } = {},
): string {
  const maxAgeMs = options.maxAgeMs ?? DEFAULT_SESSION_MAX_AGE_MS
  const now = options.now ?? Date.now()
  const exp = now + maxAgeMs
  const payload = `${userId}.${exp}`
  return `${payload}.${sign(payload)}`
}

export function unsealSession(
  token: string,
  options: { now?: number } = {},
): { userId: string } | null {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }
  const [userId, expRaw, signature] = parts
  if (!userId || !expRaw || !signature) {
    return null
  }
  const payload = `${userId}.${expRaw}`
  if (!safeEqual(sign(payload), signature)) {
    return null
  }
  const exp = Number(expRaw)
  if (!Number.isFinite(exp)) {
    return null
  }
  const now = options.now ?? Date.now()
  if (exp < now) {
    return null
  }
  return { userId }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function upsertUserByEmail(db: AppDb, email: string): SessionUser {
  const normalized = normalizeEmail(email)
  if (!normalized.includes('@')) {
    throw new Error('Invalid email')
  }

  const existing = db.select().from(users).where(eq(users.email, normalized)).get()
  if (existing) {
    return existing
  }

  const user: SessionUser = {
    id: randomUUID(),
    email: normalized,
    createdAt: new Date(),
  }
  db.insert(users).values(user).run()
  seedDefaultCategories(db, user.id)
  return user
}

export function findUserById(db: AppDb, id: string): SessionUser | undefined {
  return db.select().from(users).where(eq(users.id, id)).get()
}

export function requireSessionUser(
  db: AppDb,
  token: string | undefined,
): SessionUser {
  if (!token) {
    throw new AuthError('Unauthorized')
  }
  const session = unsealSession(token)
  if (!session) {
    throw new AuthError('Unauthorized')
  }
  const user = findUserById(db, session.userId)
  if (!user) {
    throw new AuthError('Unauthorized')
  }
  return user
}

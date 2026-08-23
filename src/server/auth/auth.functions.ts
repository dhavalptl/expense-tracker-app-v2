import { createServerFn } from '@tanstack/react-start'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

import { getDb } from '../db/index.ts'
import {
  DEFAULT_SESSION_MAX_AGE_MS,
  SESSION_COOKIE,
  findUserById,
  requireSessionUser,
  sealSession,
  unsealSession,
  upsertUserByEmail,
} from './session.ts'

const signInInput = z.object({
  email: z.email(),
})

export const signInWithEmail = createServerFn({ method: 'POST' })
  .validator(signInInput)
  .handler(async ({ data }) => {
    const user = upsertUserByEmail(getDb(), data.email)
    const token = sealSession(user.id)
    setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.floor(DEFAULT_SESSION_MAX_AGE_MS / 1000),
    })
    return { id: user.id, email: user.email }
  })

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const token = getCookie(SESSION_COOKIE)
  if (!token) {
    return null
  }
  const payload = unsealSession(token)
  if (!payload) {
    return null
  }
  const user = findUserById(getDb(), payload.userId)
  if (!user) {
    return null
  }
  return { userId: user.id, email: user.email }
})

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  deleteCookie(SESSION_COOKIE, { path: '/' })
  return { ok: true as const }
})

/** Privileged seam: throws AuthError when no valid session. */
export const requireSession = createServerFn({ method: 'GET' }).handler(async () => {
  const user = requireSessionUser(getDb(), getCookie(SESSION_COOKIE))
  return { userId: user.id, email: user.email }
})

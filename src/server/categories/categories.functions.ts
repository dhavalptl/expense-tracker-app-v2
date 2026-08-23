import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

import { requireSessionUser, SESSION_COOKIE } from '../auth/session.ts'
import { getDb } from '../db/index.ts'
import {
  createCategory,
  deleteCategory,
  listCategories,
  renameCategory,
} from './categories.ts'

function currentUser() {
  return requireSessionUser(getDb(), getCookie(SESSION_COOKIE))
}

export const listMyCategories = createServerFn({ method: 'GET' }).handler(async () => {
  const user = currentUser()
  return listCategories(getDb(), user.id)
})

export const createMyCategory = createServerFn({ method: 'POST' })
  .validator(z.object({ name: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const user = currentUser()
    return createCategory(getDb(), user.id, data.name)
  })

export const renameMyCategory = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      categoryId: z.string().min(1),
      name: z.string().min(1).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const user = currentUser()
    return renameCategory(getDb(), user.id, data.categoryId, data.name)
  })

export const deleteMyCategory = createServerFn({ method: 'POST' })
  .validator(z.object({ categoryId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const user = currentUser()
    deleteCategory(getDb(), user.id, data.categoryId)
    return { ok: true as const }
  })

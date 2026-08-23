import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

import { requireSessionUser, SESSION_COOKIE } from '../auth/session.ts'
import { getDb } from '../db/index.ts'
import { getBudgetOverview, upsertMonthlyBudget } from './budget.ts'

function currentUser() {
  return requireSessionUser(getDb(), getCookie(SESSION_COOKIE))
}

export const getMyBudgetOverview = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = currentUser()
    return getBudgetOverview(getDb(), user.id)
  },
)

export const setMyMonthlyBudget = createServerFn({ method: 'POST' })
  .validator(z.object({ limitPaise: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const user = currentUser()
    upsertMonthlyBudget(getDb(), user.id, data.limitPaise)
    return getBudgetOverview(getDb(), user.id)
  })

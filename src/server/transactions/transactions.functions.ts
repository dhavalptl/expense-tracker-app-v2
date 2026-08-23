import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { z } from 'zod'

import { requireSessionUser, SESSION_COOKIE } from '../auth/session.ts'
import { getDb } from '../db/index.ts'
import { createExpense, createIncome } from './transactions.ts'

function currentUser() {
  return requireSessionUser(getDb(), getCookie(SESSION_COOKIE))
}

const expenseInput = z.object({
  amountPaise: z.number().int().positive(),
  categoryId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(500).optional(),
})

const incomeInput = z.object({
  amountPaise: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(500).optional(),
})

export const createExpenseFn = createServerFn({ method: 'POST' })
  .validator(expenseInput)
  .handler(async ({ data }) => {
    const user = currentUser()
    return createExpense(getDb(), user.id, data)
  })

export const createIncomeFn = createServerFn({ method: 'POST' })
  .validator(incomeInput)
  .handler(async ({ data }) => {
    const user = currentUser()
    return createIncome(getDb(), user.id, data)
  })

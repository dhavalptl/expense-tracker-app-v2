import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { upsertUserByEmail } from '../auth/session.ts'
import { listCategories } from '../categories/categories.ts'
import { createDb, type AppDb } from '../db/index.ts'
import { createExpense } from '../transactions/transactions.ts'
import { getBudgetOverview, upsertMonthlyBudget } from './budget.ts'

function tempDb() {
  const dbPath = path.join(
    os.tmpdir(),
    `expense-budget-${Date.now()}-${Math.random()}.sqlite`,
  )
  const db = createDb(dbPath)
  return {
    db,
    cleanup() {
      fs.rmSync(dbPath, { force: true })
      fs.rmSync(`${dbPath}-wal`, { force: true })
      fs.rmSync(`${dbPath}-shm`, { force: true })
    },
  }
}

describe('monthly budget overview', () => {
  let db: AppDb
  let cleanup: () => void

  beforeEach(() => {
    ;({ db, cleanup } = tempDb())
  })

  afterEach(() => {
    cleanup()
  })

  it('sums current-month expenses against the limit', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const food = listCategories(db, user.id).find((c) => c.name === 'Food')!
    const now = new Date('2026-08-15T10:00:00.000Z')

    upsertMonthlyBudget(db, user.id, 100000, now)
    createExpense(db, user.id, {
      amountPaise: 40000,
      categoryId: food.id,
      date: '2026-08-10',
    })
    createExpense(db, user.id, {
      amountPaise: 20000,
      categoryId: food.id,
      date: '2026-07-31',
    })

    const overview = getBudgetOverview(db, user.id, now)
    expect(overview.yearMonth).toBe('2026-08')
    expect(overview.limitPaise).toBe(100000)
    expect(overview.spentPaise).toBe(40000)
    expect(overview.status).toBe('under')
  })
})

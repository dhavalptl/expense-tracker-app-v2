import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { upsertUserByEmail } from '../auth/session.ts'
import { upsertMonthlyBudget } from '../budgets/budget.ts'
import { listCategories } from '../categories/categories.ts'
import { createDb, type AppDb } from '../db/index.ts'
import { createExpense, createIncome } from '../transactions/transactions.ts'
import { getDashboardSummary } from './dashboard.ts'

function tempDb() {
  const dbPath = path.join(
    os.tmpdir(),
    `expense-dash-${Date.now()}-${Math.random()}.sqlite`,
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

describe('getDashboardSummary', () => {
  let db: AppDb
  let cleanup: () => void

  beforeEach(() => {
    ;({ db, cleanup } = tempDb())
  })

  afterEach(() => {
    cleanup()
  })

  it('aggregates this-month income, expense, net, category spend, and budget', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const food = listCategories(db, user.id).find((c) => c.name === 'Food')!
    const transport = listCategories(db, user.id).find((c) => c.name === 'Transport')!
    const now = new Date('2026-08-15T10:00:00.000Z')

    upsertMonthlyBudget(db, user.id, 100000, now)
    createIncome(db, user.id, {
      amountPaise: 500000,
      date: '2026-08-01',
      note: 'Salary',
    })
    createExpense(db, user.id, {
      amountPaise: 30000,
      categoryId: food.id,
      date: '2026-08-10',
      note: 'Groceries',
    })
    createExpense(db, user.id, {
      amountPaise: 20000,
      categoryId: transport.id,
      date: '2026-08-12',
      note: 'Cab',
    })
    // Outside month — ignored
    createExpense(db, user.id, {
      amountPaise: 99999,
      categoryId: food.id,
      date: '2026-07-01',
    })

    const summary = getDashboardSummary(db, user.id, now)

    expect(summary.yearMonth).toBe('2026-08')
    expect(summary.incomePaise).toBe(500000)
    expect(summary.expensePaise).toBe(50000)
    expect(summary.netPaise).toBe(450000)
    expect(summary.spendByCategory).toEqual([
      { categoryId: food.id, categoryName: 'Food', amountPaise: 30000 },
      { categoryId: transport.id, categoryName: 'Transport', amountPaise: 20000 },
    ])
    expect(summary.budget).toEqual({
      limitPaise: 100000,
      spentPaise: 50000,
      status: 'under',
    })
  })

  it('returns zeros and empty breakdown when there is no activity', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const summary = getDashboardSummary(
      db,
      user.id,
      new Date('2026-08-15T10:00:00.000Z'),
    )
    expect(summary.incomePaise).toBe(0)
    expect(summary.expensePaise).toBe(0)
    expect(summary.netPaise).toBe(0)
    expect(summary.spendByCategory).toEqual([])
    expect(summary.budget.limitPaise).toBeNull()
    expect(summary.budget.status).toBeNull()
  })
})

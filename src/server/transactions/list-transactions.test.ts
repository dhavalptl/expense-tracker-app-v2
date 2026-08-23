import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { upsertUserByEmail } from '../auth/session.ts'
import { listCategories } from '../categories/categories.ts'
import { createDb, type AppDb } from '../db/index.ts'
import { createExpense, createIncome, listTransactions } from './transactions.ts'

function tempDb() {
  const dbPath = path.join(
    os.tmpdir(),
    `expense-list-${Date.now()}-${Math.random()}.sqlite`,
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

describe('listTransactions', () => {
  let db: AppDb
  let cleanup: () => void

  beforeEach(() => {
    ;({ db, cleanup } = tempDb())
  })

  afterEach(() => {
    cleanup()
  })

  it('returns only the owner transactions newest date first', () => {
    const ada = upsertUserByEmail(db, 'ada@example.com')
    const bob = upsertUserByEmail(db, 'bob@example.com')
    const food = listCategories(db, ada.id).find((c) => c.name === 'Food')!
    const bobFood = listCategories(db, bob.id).find((c) => c.name === 'Food')!

    createExpense(db, ada.id, {
      amountPaise: 100,
      categoryId: food.id,
      date: '2026-08-01',
      note: 'Old',
    })
    createExpense(db, ada.id, {
      amountPaise: 200,
      categoryId: food.id,
      date: '2026-08-20',
      note: 'New',
    })
    createExpense(db, bob.id, {
      amountPaise: 999,
      categoryId: bobFood.id,
      date: '2026-08-21',
      note: 'Bob',
    })

    const rows = listTransactions(db, ada.id, {})
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.note)).toEqual(['New', 'Old'])
  })

  it('filters by type, category, note search, and date range', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const food = listCategories(db, user.id).find((c) => c.name === 'Food')!
    const transport = listCategories(db, user.id).find((c) => c.name === 'Transport')!

    createExpense(db, user.id, {
      amountPaise: 100,
      categoryId: food.id,
      date: '2026-08-10',
      note: 'Team lunch',
    })
    createExpense(db, user.id, {
      amountPaise: 200,
      categoryId: transport.id,
      date: '2026-08-11',
      note: 'Cab',
    })
    createIncome(db, user.id, {
      amountPaise: 500,
      date: '2026-08-12',
      note: 'Bonus lunch mention',
    })

    const lunchExpenses = listTransactions(db, user.id, {
      q: 'lunch',
      type: 'expense',
      categoryId: food.id,
      from: '2026-08-01',
      to: '2026-08-31',
    })
    expect(lunchExpenses).toHaveLength(1)
    expect(lunchExpenses[0]?.note).toBe('Team lunch')
  })
})

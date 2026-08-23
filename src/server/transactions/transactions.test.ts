import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { upsertUserByEmail } from '../auth/session.ts'
import { listCategories } from '../categories/categories.ts'
import { createDb, type AppDb } from '../db/index.ts'
import {
  TransactionError,
  createExpense,
  createIncome,
} from './transactions.ts'

function tempDb() {
  const dbPath = path.join(
    os.tmpdir(),
    `expense-txn-${Date.now()}-${Math.random()}.sqlite`,
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

describe('createExpense', () => {
  let db: AppDb
  let cleanup: () => void

  beforeEach(() => {
    ;({ db, cleanup } = tempDb())
  })

  afterEach(() => {
    cleanup()
  })

  it('creates an expense with owned category and paise amount', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const food = listCategories(db, user.id).find((c) => c.name === 'Food')!

    const txn = createExpense(db, user.id, {
      amountPaise: 12550,
      categoryId: food.id,
      date: '2026-08-23',
      note: 'Lunch',
    })

    expect(txn.type).toBe('expense')
    expect(txn.amountPaise).toBe(12550)
    expect(txn.categoryId).toBe(food.id)
    expect(txn.note).toBe('Lunch')
    expect(txn.date).toBe('2026-08-23')
  })

  it('rejects expense without a category', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    expect(() =>
      createExpense(db, user.id, {
        amountPaise: 100,
        categoryId: '',
        date: '2026-08-23',
      }),
    ).toThrow(TransactionError)
  })

  it('rejects expense for another user category', () => {
    const ada = upsertUserByEmail(db, 'ada@example.com')
    const bob = upsertUserByEmail(db, 'bob@example.com')
    const adaFood = listCategories(db, ada.id).find((c) => c.name === 'Food')!

    expect(() =>
      createExpense(db, bob.id, {
        amountPaise: 100,
        categoryId: adaFood.id,
        date: '2026-08-23',
      }),
    ).toThrow(/category/i)
  })

  it('rejects non-positive amounts', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const food = listCategories(db, user.id).find((c) => c.name === 'Food')!
    expect(() =>
      createExpense(db, user.id, {
        amountPaise: 0,
        categoryId: food.id,
        date: '2026-08-23',
      }),
    ).toThrow(/amount/i)
  })
})

describe('createIncome', () => {
  let db: AppDb
  let cleanup: () => void

  beforeEach(() => {
    ;({ db, cleanup } = tempDb())
  })

  afterEach(() => {
    cleanup()
  })

  it('creates income without a category', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const txn = createIncome(db, user.id, {
      amountPaise: 5000000,
      date: '2026-08-01',
      note: 'Salary',
    })
    expect(txn.type).toBe('income')
    expect(txn.categoryId).toBeNull()
    expect(txn.amountPaise).toBe(5000000)
  })
})

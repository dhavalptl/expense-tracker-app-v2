import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { upsertUserByEmail } from '../auth/session.ts'
import { createDb, type AppDb } from '../db/index.ts'
import { transactions } from '../db/schema.ts'
import {
  CategoryError,
  DEFAULT_CATEGORY_NAMES,
  createCategory,
  deleteCategory,
  listCategories,
  renameCategory,
} from './categories.ts'

function tempDb() {
  const dbPath = path.join(
    os.tmpdir(),
    `expense-cat-${Date.now()}-${Math.random()}.sqlite`,
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

describe('category seeds on user create', () => {
  let db: AppDb
  let cleanup: () => void

  beforeEach(() => {
    ;({ db, cleanup } = tempDb())
  })

  afterEach(() => {
    cleanup()
  })

  it('seeds the default expense categories exactly once for a new user', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const cats = listCategories(db, user.id)
    expect(cats.map((c) => c.name).sort()).toEqual([...DEFAULT_CATEGORY_NAMES].sort())
  })

  it('does not duplicate seeds on subsequent sign-in upsert', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    upsertUserByEmail(db, 'ada@example.com')
    expect(listCategories(db, user.id)).toHaveLength(DEFAULT_CATEGORY_NAMES.length)
  })
})

describe('category CRUD ownership', () => {
  let db: AppDb
  let cleanup: () => void

  beforeEach(() => {
    ;({ db, cleanup } = tempDb())
  })

  afterEach(() => {
    cleanup()
  })

  it('creates a custom category for the owner', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const created = createCategory(db, user.id, 'Coffee')
    expect(created.name).toBe('Coffee')
    expect(listCategories(db, user.id).some((c) => c.name === 'Coffee')).toBe(true)
  })

  it('renames an owned category', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const food = listCategories(db, user.id).find((c) => c.name === 'Food')!
    const renamed = renameCategory(db, user.id, food.id, 'Groceries')
    expect(renamed.name).toBe('Groceries')
  })

  it('rejects rename for another user category', () => {
    const ada = upsertUserByEmail(db, 'ada@example.com')
    const bob = upsertUserByEmail(db, 'bob@example.com')
    const food = listCategories(db, ada.id).find((c) => c.name === 'Food')!
    expect(() => renameCategory(db, bob.id, food.id, 'Hack')).toThrow(CategoryError)
  })

  it('deletes an unused owned category', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const created = createCategory(db, user.id, 'Temp')
    deleteCategory(db, user.id, created.id)
    expect(listCategories(db, user.id).some((c) => c.id === created.id)).toBe(false)
  })

  it('blocks delete when a transaction references the category', () => {
    const user = upsertUserByEmail(db, 'ada@example.com')
    const food = listCategories(db, user.id).find((c) => c.name === 'Food')!
    db.insert(transactions)
      .values({
        id: randomUUID(),
        userId: user.id,
        type: 'expense',
        amountPaise: 100,
        categoryId: food.id,
        date: '2026-08-23',
        note: null,
        createdAt: new Date(),
      })
      .run()

    expect(() => deleteCategory(db, user.id, food.id)).toThrow(/in use/i)
  })
})

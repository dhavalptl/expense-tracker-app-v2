import { randomUUID } from 'node:crypto'

import { and, count, eq } from 'drizzle-orm'

import type { AppDb } from '../db/index.ts'
import { categories, transactions } from '../db/schema.ts'

export const DEFAULT_CATEGORY_NAMES = [
  'Food',
  'Transport',
  'Housing',
  'Shopping',
  'Utilities',
  'Health',
  'Other',
] as const

export class CategoryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CategoryError'
  }
}

export type Category = {
  id: string
  userId: string
  name: string
  createdAt: Date
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export function seedDefaultCategories(db: AppDb, userId: string): void {
  const existing = db
    .select({ value: count() })
    .from(categories)
    .where(eq(categories.userId, userId))
    .get()
  if ((existing?.value ?? 0) > 0) {
    return
  }

  const now = new Date()
  for (const name of DEFAULT_CATEGORY_NAMES) {
    db.insert(categories)
      .values({
        id: randomUUID(),
        userId,
        name,
        createdAt: now,
      })
      .run()
  }
}

export function listCategories(db: AppDb, userId: string): Category[] {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .all()
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function createCategory(db: AppDb, userId: string, name: string): Category {
  const normalized = normalizeName(name)
  if (!normalized) {
    throw new CategoryError('Category name is required')
  }

  const duplicate = db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, normalized)))
    .get()
  if (duplicate) {
    throw new CategoryError('A category with that name already exists')
  }

  const category: Category = {
    id: randomUUID(),
    userId,
    name: normalized,
    createdAt: new Date(),
  }
  db.insert(categories).values(category).run()
  return category
}

function requireOwnedCategory(db: AppDb, userId: string, categoryId: string): Category {
  const category = db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .get()
  if (!category) {
    throw new CategoryError('Category not found')
  }
  return category
}

export function renameCategory(
  db: AppDb,
  userId: string,
  categoryId: string,
  name: string,
): Category {
  const normalized = normalizeName(name)
  if (!normalized) {
    throw new CategoryError('Category name is required')
  }
  requireOwnedCategory(db, userId, categoryId)

  const duplicate = db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, normalized)))
    .get()
  if (duplicate && duplicate.id !== categoryId) {
    throw new CategoryError('A category with that name already exists')
  }

  db.update(categories)
    .set({ name: normalized })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .run()

  return requireOwnedCategory(db, userId, categoryId)
}

export function deleteCategory(db: AppDb, userId: string, categoryId: string): void {
  requireOwnedCategory(db, userId, categoryId)

  const usage = db
    .select({ value: count() })
    .from(transactions)
    .where(eq(transactions.categoryId, categoryId))
    .get()
  if ((usage?.value ?? 0) > 0) {
    throw new CategoryError('Category is in use by transactions and cannot be deleted')
  }

  db.delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .run()
}

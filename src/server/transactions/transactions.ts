import { randomUUID } from 'node:crypto'

import { and, desc, eq, gte, like, lte, sql } from 'drizzle-orm'

import type { AppDb } from '../db/index.ts'
import { categories, transactions } from '../db/schema.ts'
import type { HistorySearch } from './history-search.ts'

export class TransactionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TransactionError'
  }
}

export type Transaction = {
  id: string
  userId: string
  type: 'expense' | 'income'
  amountPaise: number
  categoryId: string | null
  date: string
  note: string | null
  createdAt: Date
}

export type CreateExpenseInput = {
  amountPaise: number
  categoryId: string
  date: string
  note?: string
}

export type CreateIncomeInput = {
  amountPaise: number
  date: string
  note?: string
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const HISTORY_LIMIT = 100

function assertAmountPaise(amountPaise: number) {
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new TransactionError('Amount must be a positive number of paise')
  }
}

function assertDate(date: string) {
  if (!DATE_RE.test(date)) {
    throw new TransactionError('Date must be YYYY-MM-DD')
  }
}

function normalizeNote(note: string | undefined): string | null {
  if (note == null) {
    return null
  }
  const trimmed = note.trim()
  return trimmed.length > 0 ? trimmed : null
}

function requireOwnedCategory(db: AppDb, userId: string, categoryId: string) {
  if (!categoryId) {
    throw new TransactionError('Category is required for expenses')
  }
  const category = db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .get()
  if (!category) {
    throw new TransactionError('Category not found')
  }
  return category
}

export function createExpense(
  db: AppDb,
  userId: string,
  input: CreateExpenseInput,
): Transaction {
  assertAmountPaise(input.amountPaise)
  assertDate(input.date)
  requireOwnedCategory(db, userId, input.categoryId)

  const txn: Transaction = {
    id: randomUUID(),
    userId,
    type: 'expense',
    amountPaise: input.amountPaise,
    categoryId: input.categoryId,
    date: input.date,
    note: normalizeNote(input.note),
    createdAt: new Date(),
  }
  db.insert(transactions).values(txn).run()
  return txn
}

export function createIncome(
  db: AppDb,
  userId: string,
  input: CreateIncomeInput,
): Transaction {
  assertAmountPaise(input.amountPaise)
  assertDate(input.date)

  const txn: Transaction = {
    id: randomUUID(),
    userId,
    type: 'income',
    amountPaise: input.amountPaise,
    categoryId: null,
    date: input.date,
    note: normalizeNote(input.note),
    createdAt: new Date(),
  }
  db.insert(transactions).values(txn).run()
  return txn
}

export function listTransactions(
  db: AppDb,
  userId: string,
  filters: HistorySearch,
  limit: number = HISTORY_LIMIT,
): Transaction[] {
  const conditions = [eq(transactions.userId, userId)]

  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type))
  }
  if (filters.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId))
  }
  if (filters.from) {
    conditions.push(gte(transactions.date, filters.from))
  }
  if (filters.to) {
    conditions.push(lte(transactions.date, filters.to))
  }
  if (filters.q) {
    conditions.push(like(transactions.note, `%${filters.q}%`))
  }

  return db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(limit)
    .all()
}

export function sumExpensesInRange(
  db: AppDb,
  userId: string,
  from: string,
  to: string,
): number {
  const row = db
    .select({
      total: sql<number>`coalesce(sum(${transactions.amountPaise}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, from),
        lte(transactions.date, to),
      ),
    )
    .get()
  return Number(row?.total ?? 0)
}

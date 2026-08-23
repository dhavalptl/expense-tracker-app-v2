import { randomUUID } from 'node:crypto'

import { and, eq } from 'drizzle-orm'

import type { AppDb } from '../db/index.ts'
import { budgets } from '../db/schema.ts'
import { sumExpensesInRange } from '../transactions/transactions.ts'

export type BudgetStatus = 'under' | 'at' | 'over'

export type MonthRange = {
  yearMonth: string
  from: string
  to: string
}

export type BudgetOverview = {
  yearMonth: string
  from: string
  to: string
  limitPaise: number | null
  spentPaise: number
  status: BudgetStatus | null
}

const TZ = 'Asia/Kolkata'

function kolkataYmd(now: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)
  return { year, month, day }
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function currentMonthRange(now: Date = new Date()): MonthRange {
  const { year, month } = kolkataYmd(now)
  const mm = String(month).padStart(2, '0')
  const last = String(daysInMonth(year, month)).padStart(2, '0')
  return {
    yearMonth: `${year}-${mm}`,
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${last}`,
  }
}

export function budgetStatus(spentPaise: number, limitPaise: number): BudgetStatus {
  if (spentPaise < limitPaise) {
    return 'under'
  }
  if (spentPaise === limitPaise) {
    return 'at'
  }
  return 'over'
}

export function upsertMonthlyBudget(
  db: AppDb,
  userId: string,
  limitPaise: number,
  now: Date = new Date(),
) {
  if (!Number.isInteger(limitPaise) || limitPaise <= 0) {
    throw new Error('Budget limit must be a positive amount in paise')
  }

  const { yearMonth } = currentMonthRange(now)
  const existing = db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.yearMonth, yearMonth)))
    .get()

  if (existing) {
    db.update(budgets)
      .set({ limitPaise })
      .where(eq(budgets.id, existing.id))
      .run()
    return { ...existing, limitPaise }
  }

  const row = {
    id: randomUUID(),
    userId,
    yearMonth,
    limitPaise,
    createdAt: new Date(),
  }
  db.insert(budgets).values(row).run()
  return row
}

export function getBudgetOverview(
  db: AppDb,
  userId: string,
  now: Date = new Date(),
): BudgetOverview {
  const range = currentMonthRange(now)
  const budget = db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.yearMonth, range.yearMonth)))
    .get()
  const spentPaise = sumExpensesInRange(db, userId, range.from, range.to)
  const limitPaise = budget?.limitPaise ?? null

  return {
    yearMonth: range.yearMonth,
    from: range.from,
    to: range.to,
    limitPaise,
    spentPaise,
    status: limitPaise == null ? null : budgetStatus(spentPaise, limitPaise),
  }
}

import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

import { currentMonthRange, getBudgetOverview } from '../budgets/budget.ts'
import type { AppDb } from '../db/index.ts'
import { categories, transactions } from '../db/schema.ts'

export type SpendByCategory = {
  categoryId: string
  categoryName: string
  amountPaise: number
}

export type DashboardSummary = {
  yearMonth: string
  from: string
  to: string
  incomePaise: number
  expensePaise: number
  netPaise: number
  spendByCategory: SpendByCategory[]
  budget: {
    limitPaise: number | null
    spentPaise: number
    status: 'under' | 'at' | 'over' | null
  }
}

export function getDashboardSummary(
  db: AppDb,
  userId: string,
  now: Date = new Date(),
): DashboardSummary {
  const range = currentMonthRange(now)
  const budget = getBudgetOverview(db, userId, now)

  const totals = db
    .select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amountPaise}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, range.from),
        lte(transactions.date, range.to),
      ),
    )
    .groupBy(transactions.type)
    .all()

  let incomePaise = 0
  let expensePaise = 0
  for (const row of totals) {
    const total = Number(row.total)
    if (row.type === 'income') {
      incomePaise = total
    } else if (row.type === 'expense') {
      expensePaise = total
    }
  }

  const spendByCategory = db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      amountPaise: sql<number>`coalesce(sum(${transactions.amountPaise}), 0)`,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, range.from),
        lte(transactions.date, range.to),
      ),
    )
    .groupBy(transactions.categoryId, categories.name)
    .orderBy(desc(sql`sum(${transactions.amountPaise})`))
    .all()
    .map((row) => ({
      categoryId: row.categoryId!,
      categoryName: row.categoryName,
      amountPaise: Number(row.amountPaise),
    }))

  return {
    yearMonth: range.yearMonth,
    from: range.from,
    to: range.to,
    incomePaise,
    expensePaise,
    netPaise: incomePaise - expensePaise,
    spendByCategory,
    budget: {
      limitPaise: budget.limitPaise,
      spentPaise: budget.spentPaise,
      status: budget.status,
    },
  }
}

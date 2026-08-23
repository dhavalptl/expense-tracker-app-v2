import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  type: text('type', { enum: ['expense', 'income'] }).notNull(),
  amountPaise: integer('amount_paise').notNull(),
  categoryId: text('category_id').references(() => categories.id),
  date: text('date').notNull(), // YYYY-MM-DD
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  /** Calendar month key in Asia/Kolkata, e.g. "2026-08" */
  yearMonth: text('year_month').notNull(),
  limitPaise: integer('limit_paise').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

import { describe, expect, it } from 'vitest'

import { budgetStatus, currentMonthRange } from './budget.ts'

describe('budgetStatus', () => {
  it('is under when spent is below the limit', () => {
    expect(budgetStatus(5000, 10000)).toBe('under')
  })

  it('is at when spent equals the limit', () => {
    expect(budgetStatus(10000, 10000)).toBe('at')
  })

  it('is over when spent exceeds the limit', () => {
    expect(budgetStatus(10001, 10000)).toBe('over')
  })
})

describe('currentMonthRange', () => {
  it('returns Asia/Kolkata calendar month bounds', () => {
    // 2026-08-15 10:00 UTC → still Aug 15 in Kolkata
    const range = currentMonthRange(new Date('2026-08-15T10:00:00.000Z'))
    expect(range.yearMonth).toBe('2026-08')
    expect(range.from).toBe('2026-08-01')
    expect(range.to).toBe('2026-08-31')
  })

  it('uses Kolkata date when UTC is still previous day', () => {
    // 2026-07-31 20:00 UTC = 2026-08-01 01:30 IST
    const range = currentMonthRange(new Date('2026-07-31T20:00:00.000Z'))
    expect(range.yearMonth).toBe('2026-08')
    expect(range.from).toBe('2026-08-01')
    expect(range.to).toBe('2026-08-31')
  })
})

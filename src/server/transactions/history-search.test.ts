import { describe, expect, it } from 'vitest'

import { parseHistorySearch } from './history-search.ts'

describe('parseHistorySearch', () => {
  it('returns empty defaults for blank search', () => {
    expect(parseHistorySearch({})).toEqual({
      q: undefined,
      type: undefined,
      categoryId: undefined,
      from: undefined,
      to: undefined,
    })
  })

  it('parses q, type, categoryId, and date range', () => {
    expect(
      parseHistorySearch({
        q: ' lunch ',
        type: 'expense',
        categoryId: 'cat-1',
        from: '2026-08-01',
        to: '2026-08-31',
      }),
    ).toEqual({
      q: 'lunch',
      type: 'expense',
      categoryId: 'cat-1',
      from: '2026-08-01',
      to: '2026-08-31',
    })
  })

  it('drops invalid type and dates', () => {
    expect(
      parseHistorySearch({
        type: 'transfer',
        from: '08-01-2026',
        to: 'nope',
      }),
    ).toEqual({
      q: undefined,
      type: undefined,
      categoryId: undefined,
      from: undefined,
      to: undefined,
    })
  })
})

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export type HistorySearch = {
  q?: string
  type?: 'expense' | 'income'
  categoryId?: string
  from?: string
  to?: string
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export function parseHistorySearch(input: Record<string, unknown>): HistorySearch {
  const qRaw = asString(input.q)?.trim()
  const typeRaw = asString(input.type)
  const categoryId = asString(input.categoryId)?.trim() || undefined
  const fromRaw = asString(input.from)
  const toRaw = asString(input.to)

  return {
    q: qRaw || undefined,
    type: typeRaw === 'expense' || typeRaw === 'income' ? typeRaw : undefined,
    categoryId,
    from: fromRaw && DATE_RE.test(fromRaw) ? fromRaw : undefined,
    to: toRaw && DATE_RE.test(toRaw) ? toRaw : undefined,
  }
}

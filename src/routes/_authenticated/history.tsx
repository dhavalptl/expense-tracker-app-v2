import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import { formatInr } from '#/lib/money.ts'
import { listMyCategories } from '#/server/categories/categories.functions.ts'
import { parseHistorySearch } from '#/server/transactions/history-search.ts'
import { listMyTransactions } from '#/server/transactions/transactions.functions.ts'

const historySearchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['expense', 'income']).optional(),
  categoryId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/history')({
  validateSearch: (search) => historySearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const filters = parseHistorySearch(deps)
    const [transactions, categories] = await Promise.all([
      listMyTransactions({ data: filters }),
      listMyCategories(),
    ])
    return { transactions, categories, filters }
  },
  component: HistoryPage,
})

function HistoryPage() {
  const { transactions, categories, filters } = Route.useLoaderData()
  const navigate = useNavigate({ from: Route.fullPath })
  const categoryName = new Map(categories.map((c) => [c.id, c.name]))

  function updateSearch(patch: Record<string, string | undefined>) {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch }
        for (const key of Object.keys(next) as Array<keyof typeof next>) {
          if (!next[key]) {
            delete next[key]
          }
        }
        return next
      },
    })
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">
          Search notes and filter by type, category, or date.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="q">Search note</Label>
          <Input
            id="q"
            defaultValue={filters.q ?? ''}
            placeholder="e.g. lunch"
            onBlur={(event) => updateSearch({ q: event.target.value.trim() || undefined })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                updateSearch({ q: event.currentTarget.value.trim() || undefined })
              }
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={filters.type ?? 'all'}
              onValueChange={(value) =>
                updateSearch({
                  type: value === 'all' || value == null ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.categoryId ?? 'all'}
              onValueChange={(value) =>
                updateSearch({
                  categoryId: value === 'all' || value == null ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="date"
              value={filters.from ?? ''}
              onChange={(event) =>
                updateSearch({ from: event.target.value || undefined })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="date"
              value={filters.to ?? ''}
              onChange={(event) => updateSearch({ to: event.target.value || undefined })}
            />
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="space-y-3 border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">No transactions match these filters.</p>
          <Button asChild>
            <Link to="/add">Add a transaction</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {transactions.map((txn) => (
            <li
              key={txn.id}
              className="flex items-start justify-between gap-3 border border-border px-3 py-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium capitalize">{txn.type}</p>
                <p className="text-xs text-muted-foreground">
                  {txn.date}
                  {txn.categoryId
                    ? ` · ${categoryName.get(txn.categoryId) ?? 'Category'}`
                    : null}
                </p>
                {txn.note ? <p className="text-sm">{txn.note}</p> : null}
              </div>
              <p
                className={
                  txn.type === 'income'
                    ? 'text-sm font-medium text-emerald-700'
                    : 'text-sm font-medium'
                }
              >
                {txn.type === 'income' ? '+' : '-'}
                {formatInr(txn.amountPaise)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

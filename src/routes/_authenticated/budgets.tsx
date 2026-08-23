import { useState } from 'react'

import { Link, createFileRoute, useRouter } from '@tanstack/react-router'

import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import { formatInr, parseInrToPaise } from '#/lib/money.ts'
import {
  getMyBudgetOverview,
  setMyMonthlyBudget,
} from '#/server/budgets/budget.functions.ts'

export const Route = createFileRoute('/_authenticated/budgets')({
  loader: () => getMyBudgetOverview(),
  component: BudgetsPage,
})

function BudgetsPage() {
  const overview = Route.useLoaderData()
  const router = useRouter()
  const [amount, setAmount] = useState(
    overview.limitPaise != null ? String(overview.limitPaise / 100) : '',
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const progress =
    overview.limitPaise && overview.limitPaise > 0
      ? Math.min(100, Math.round((overview.spentPaise / overview.limitPaise) * 100))
      : 0

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await setMyMonthlyBudget({ data: { limitPaise: parseInrToPaise(amount) } })
      await router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save budget')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Budgets</h1>
        <p className="text-sm text-muted-foreground">
          Set a total expense limit for {overview.yearMonth} (Asia/Kolkata calendar month).
        </p>
      </div>

      <div className="space-y-2 border border-border px-3 py-3">
        <p className="text-sm">
          Spent this month:{' '}
          <span className="font-medium">{formatInr(overview.spentPaise)}</span>
        </p>
        <p className="text-sm">
          Limit:{' '}
          <span className="font-medium">
            {overview.limitPaise != null ? formatInr(overview.limitPaise) : 'Not set'}
          </span>
        </p>
        {overview.status ? (
          <p className="text-sm capitalize">
            Status: <span className="font-medium">{overview.status}</span>
          </p>
        ) : null}
        {overview.limitPaise != null ? (
          <div
            className="mt-2 h-2 w-full bg-muted"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Budget progress"
          >
            <div
              className="h-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>

      <form className="space-y-3" onSubmit={onSave}>
        <div className="space-y-2">
          <Label htmlFor="limit">Monthly expense limit (₹)</Label>
          <Input
            id="limit"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="10000"
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Saving…' : 'Save limit'}
        </Button>
      </form>

      <p className="text-sm">
        <Link to="/categories" className="underline underline-offset-4">
          Manage categories
        </Link>
      </p>
    </section>
  )
}

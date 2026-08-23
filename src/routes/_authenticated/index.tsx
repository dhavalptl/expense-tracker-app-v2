import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '#/components/ui/button.tsx'
import { formatInr } from '#/lib/money.ts'
import { getMyDashboardSummary } from '#/server/dashboard/dashboard.functions.ts'

export const Route = createFileRoute('/_authenticated/')({
  loader: () => getMyDashboardSummary(),
  component: HomePage,
})

function HomePage() {
  const summary = Route.useLoaderData()
  const hasActivity =
    summary.incomePaise > 0 ||
    summary.expensePaise > 0 ||
    summary.budget.limitPaise != null

  const budgetProgress =
    summary.budget.limitPaise && summary.budget.limitPaise > 0
      ? Math.min(
          100,
          Math.round((summary.budget.spentPaise / summary.budget.limitPaise) * 100),
        )
      : 0

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Home</h1>
        <p className="text-sm text-muted-foreground">
          Spending overview for {summary.yearMonth} (Asia/Kolkata).
        </p>
      </div>

      {!hasActivity ? (
        <div className="space-y-3 border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No activity this month yet. Log a transaction or set a budget to get started.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link to="/add">Add transaction</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/budgets">Set budget</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            <Metric label="Income" value={formatInr(summary.incomePaise)} />
            <Metric label="Expenses" value={formatInr(summary.expensePaise)} />
            <Metric label="Net" value={formatInr(summary.netPaise)} />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Spend by category</h2>
            {summary.spendByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses this month.</p>
            ) : (
              <ul className="space-y-2">
                {summary.spendByCategory.map((row) => (
                  <li
                    key={row.categoryId}
                    className="flex items-center justify-between border border-border px-3 py-2 text-sm"
                  >
                    <span>{row.categoryName}</span>
                    <span className="font-medium">{formatInr(row.amountPaise)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2 border border-border px-3 py-3">
            <h2 className="text-sm font-semibold">Budget</h2>
            {summary.budget.limitPaise == null ? (
              <p className="text-sm text-muted-foreground">
                No limit set.{' '}
                <Link to="/budgets" className="underline underline-offset-4">
                  Set a monthly budget
                </Link>
              </p>
            ) : (
              <>
                <p className="text-sm">
                  {formatInr(summary.budget.spentPaise)} of{' '}
                  {formatInr(summary.budget.limitPaise)}
                  {summary.budget.status ? (
                    <>
                      {' '}
                      · <span className="capitalize">{summary.budget.status}</span>
                    </>
                  ) : null}
                </p>
                <div
                  className="h-2 w-full bg-muted"
                  role="progressbar"
                  aria-valuenow={budgetProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Budget progress"
                >
                  <div
                    className="h-full bg-foreground"
                    style={{ width: `${budgetProgress}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tracking-tight">{value}</p>
    </div>
  )
}

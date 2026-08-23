import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/budgets')({
  component: BudgetsPage,
})

function BudgetsPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Budgets</h1>
        <p className="text-sm text-muted-foreground">
          Monthly budget limits will show progress here.
        </p>
      </div>
      <p className="text-sm">
        <Link to="/categories" className="underline underline-offset-4">
          Manage categories
        </Link>
      </p>
    </section>
  )
}

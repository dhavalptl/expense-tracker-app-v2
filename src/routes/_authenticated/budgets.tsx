import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/budgets')({
  component: BudgetsPage,
})

function BudgetsPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Budgets</h1>
      <p className="text-sm text-muted-foreground">
        Monthly budget limits will show progress here.
      </p>
    </section>
  )
}

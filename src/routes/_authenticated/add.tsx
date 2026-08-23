import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/add')({
  component: AddPage,
})

function AddPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Add</h1>
      <p className="text-sm text-muted-foreground">
        Expense and income forms land in the next money slice.
      </p>
    </section>
  )
}

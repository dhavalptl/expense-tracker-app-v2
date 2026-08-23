import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/history')({
  component: HistoryPage,
})

function HistoryPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">History</h1>
      <p className="text-sm text-muted-foreground">
        Searchable transaction history comes after logging is live.
      </p>
    </section>
  )
}

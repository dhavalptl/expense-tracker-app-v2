import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Home</h1>
      <p className="text-sm text-muted-foreground">
        Dashboard overview arrives in a later slice. Use Add to log money once categories
        are ready.
      </p>
    </section>
  )
}

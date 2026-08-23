import type { ErrorComponentProps } from '@tanstack/react-router'

import { Button } from '#/components/ui/button.tsx'

export function RouteError({ error, reset }: ErrorComponentProps) {
  const message =
    error instanceof Error ? error.message : 'This page failed to load. You can retry.'

  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-lg flex-col items-start justify-center gap-4 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground" role="alert">
          {message || 'This page failed to load. You can retry.'}
        </p>
      </div>
      <Button type="button" onClick={reset}>
        Retry
      </Button>
    </div>
  )
}

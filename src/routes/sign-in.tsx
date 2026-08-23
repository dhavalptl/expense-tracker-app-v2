import { useEffect, useState } from 'react'

import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'

import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import { getSession, signInWithEmail } from '#/server/auth/auth.functions.ts'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: '/' })
    }
  },
  component: SignInPage,
})

function formatClientError(err: unknown): string {
  if (!(err instanceof Error)) {
    return 'Could not sign in'
  }
  try {
    const parsed = JSON.parse(err.message) as Array<{ message?: string }>
    if (Array.isArray(parsed) && parsed[0]?.message) {
      return parsed[0].message
    }
  } catch {
    // not JSON
  }
  return err.message || 'Could not sign in'
}

function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  async function onContinue() {
    setError(null)
    setPending(true)
    const input = document.getElementById('email') as HTMLInputElement | null
    const email = input?.value.trim() ?? ''
    try {
      if (!email) {
        throw new Error('Email is required')
      }
      await signInWithEmail({ data: { email } })
      await router.navigate({ to: '/' })
    } catch (err) {
      setError(formatClientError(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Expense Tracker</p>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in with email</h1>
        <p className="text-sm text-muted-foreground">
          Enter a unique email to create or resume your personal ledger. No password yet —
          this is temporary dev auth.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void onContinue()
              }
            }}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          className="w-full"
          disabled={!ready || pending}
          data-ready={ready ? 'true' : 'false'}
          onClick={onContinue}
        >
          {pending ? 'Signing in…' : 'Continue'}
        </Button>
      </div>
    </main>
  )
}

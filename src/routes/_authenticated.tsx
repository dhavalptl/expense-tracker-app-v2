import { Outlet, Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'

import { Button } from '#/components/ui/button.tsx'
import { getSession, signOut } from '#/server/auth/auth.functions.ts'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/sign-in' })
    }
    return { session }
  },
  component: AuthenticatedLayout,
})

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/add', label: 'Add' },
  { to: '/history', label: 'History' },
  { to: '/budgets', label: 'Budgets' },
] as const

function AuthenticatedLayout() {
  const { session } = Route.useRouteContext()
  const router = useRouter()

  async function onSignOut() {
    await signOut()
    await router.navigate({ to: '/sign-in' })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background text-foreground">
      <div
        role="status"
        className="flex items-start justify-between gap-2 border-b border-amber-700/20 bg-amber-100 px-3 py-2 text-xs text-amber-950"
      >
        <p>
          Dev auth: email-only sign-in is not production security. Signed in as{' '}
          <span className="font-medium">{session.email}</span>.
        </p>
        <Button type="button" variant="ghost" size="xs" onClick={onSignOut}>
          Sign out
        </Button>
      </div>

      <main className="flex-1 px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-1 px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex-1 rounded-none px-2 py-2 text-center text-xs font-medium text-muted-foreground [&.active]:text-foreground"
              activeOptions={{ exact: item.to === '/' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}

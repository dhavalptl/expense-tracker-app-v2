import { expect, test } from '@playwright/test'

import {
  AddPage,
  AppShell,
  BudgetsPage,
  HistoryPage,
  HomePage,
  SignInPage,
} from './pages/app.ts'

function uniqueEmail() {
  return `e2e.user.${Date.now()}@example.com`
}

test('happy path: sign in, log money, set budget, see dashboard', async ({ page }) => {
  const email = uniqueEmail()
  const signIn = new SignInPage(page)
  const shell = new AppShell(page)
  const add = new AddPage(page)
  const history = new HistoryPage(page)
  const budgets = new BudgetsPage(page)
  const home = new HomePage(page)

  await test.step('Sign in with a unique email and land in the app shell', async () => {
    await signIn.goto()
    await signIn.signIn(email)
    await expect(page).toHaveURL('/')
    await expect(shell.banner).toContainText(/not production security/i)
    await expect(shell.banner).toContainText(email.toLowerCase())
  })

  await test.step('Log an expense and see it in history', async () => {
    await add.goto()
    await add.saveExpenseWith({ amount: '100.50', note: 'E2E lunch' })
    await expect(history.heading).toBeVisible()
    await expect(page.getByText('E2E lunch')).toBeVisible()
    await expect(page.getByText(/₹100\.50/)).toBeVisible()
  })

  await test.step('Log income and keep it in history', async () => {
    await add.goto()
    await add.saveIncomeWith({ amount: '1000', note: 'E2E salary' })
    await expect(page.getByText('E2E salary')).toBeVisible()
  })

  await test.step('Set a monthly budget limit', async () => {
    await budgets.goto()
    await budgets.setLimit('5000')
    await expect(page.getByText(/status:/i)).toBeVisible()
    await expect(page.getByText(/under|at|over/i).first()).toBeVisible()
  })

  await test.step('See this-month overview on Home', async () => {
    await home.goto()
    await expect(home.heading).toBeVisible()
    await expect(page.getByText('Income')).toBeVisible()
    await expect(page.getByText('Expenses')).toBeVisible()
    await expect(page.getByText(/^₹1,000\.00$/).first()).toBeVisible()
    await expect(page.getByRole('paragraph').filter({ hasText: /^₹100\.50$/ })).toBeVisible()
    await expect(page.getByText(/under/i).first()).toBeVisible()
  })
})

test('negative: unauthenticated users are sent to sign-in', async ({ page }) => {
  const signIn = new SignInPage(page)

  await test.step('Open a protected route without a session', async () => {
    await page.goto('/history')
    await expect(signIn.heading).toBeVisible()
    await expect(page).toHaveURL(/\/sign-in/)
  })
})

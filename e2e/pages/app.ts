import { expect, type Page } from '@playwright/test'

export class SignInPage {
  constructor(readonly page: Page) {}

  get email() {
    return this.page.getByLabel('Email')
  }
  get continueButton() {
    return this.page.getByRole('button', { name: /continue/i })
  }
  get heading() {
    return this.page.getByRole('heading', { name: /sign in with email/i })
  }

  async goto() {
    await this.page.goto('/sign-in')
    await expect(this.heading).toBeVisible()
    await expect(this.continueButton).toHaveAttribute('data-ready', 'true')
  }

  async signIn(email: string) {
    await this.email.fill(email)
    await expect(this.email).toHaveValue(email)
    await this.continueButton.click()
    await this.page.waitForURL((url) => !url.pathname.includes('sign-in'), {
      timeout: 15_000,
    })
  }
}

export class AppShell {
  constructor(readonly page: Page) {}

  get banner() {
    return this.page.getByRole('status')
  }
  get homeNav() {
    return this.page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
      name: 'Home',
    })
  }
  get addNav() {
    return this.page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
      name: 'Add',
    })
  }
  get historyNav() {
    return this.page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'History' })
  }
  get budgetsNav() {
    return this.page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Budgets' })
  }
}

export class AddPage {
  constructor(readonly page: Page) {}

  get amount() {
    return this.page.getByLabel(/amount/i)
  }
  get note() {
    return this.page.getByLabel(/note/i)
  }
  get saveExpense() {
    return this.page.getByRole('button', { name: /save expense/i })
  }
  get saveIncome() {
    return this.page.getByRole('button', { name: /save income/i })
  }
  get incomeTab() {
    return this.page.getByRole('button', { name: /^income$/i })
  }

  async goto() {
    await this.page.goto('/add')
  }

  async saveExpenseWith(opts: { amount: string; note?: string }) {
    await this.amount.fill(opts.amount)
    if (opts.note) {
      await this.note.fill(opts.note)
    }
    await this.saveExpense.click()
    await this.page.waitForURL(/\/history/, { timeout: 15_000 })
  }

  async saveIncomeWith(opts: { amount: string; note?: string }) {
    await this.incomeTab.click()
    await this.amount.fill(opts.amount)
    if (opts.note) {
      await this.note.fill(opts.note)
    }
    await this.saveIncome.click()
    await this.page.waitForURL(/\/history/, { timeout: 15_000 })
  }
}

export class HistoryPage {
  constructor(readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'History' })
  }

  async goto() {
    await this.page.goto('/history')
  }
}

export class BudgetsPage {
  constructor(readonly page: Page) {}

  get limit() {
    return this.page.getByLabel(/monthly expense limit/i)
  }
  get save() {
    return this.page.getByRole('button', { name: /save limit/i })
  }

  async goto() {
    await this.page.goto('/budgets')
  }

  async setLimit(rupees: string) {
    await this.limit.fill(rupees)
    await this.save.click()
  }
}

export class HomePage {
  constructor(readonly page: Page) {}

  get heading() {
    return this.page.getByRole('heading', { name: 'Home' })
  }

  async goto() {
    await this.page.goto('/')
  }
}

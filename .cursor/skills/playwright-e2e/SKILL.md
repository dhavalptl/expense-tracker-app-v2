---
name: playwright-e2e
description: Playwright POM e2e with test.step. Use when writing browser tests or playwright.config.
disable-model-invocation: true
---

# Playwright e2e

Use `@playwright/test`. Local: `channel: 'chrome'` if the project already does. CI (`process.env.CI`): omit `channel` (Playwright Chromium). `screenshot: 'only-on-failure'`, trace on first retry. `webServer`: production-like (`build` + `preview`) unless the repo already uses `dev`.

## Layout

```
e2e/helpers.ts
e2e/pages/FeaturePage.ts
e2e/feature.spec.ts
playwright.config.ts
```

## Rules

1. POM once a flow has 2+ tests or shared locators. Specs call page methods, not raw locator chains.
2. Every test wraps actions in `test.step('user-facing description', …)`.
3. Role/label locators. Evidence screenshots: rare, full-page, only when the assertion is visual.
4. Happy path **and** a negative case (validation, 403, disabled action).
5. Seed data once per session; do not wipe storage on every navigation.

```ts
export class TodosPage {
  constructor(readonly page: Page) {}
  readonly add = this.page.getByRole('button', { name: 'Add todo' })
  async create(title: string) {
    await this.page.getByLabel('Title').fill(title)
    await this.add.click()
  }
}

test('creates a todo', async ({ page }) => {
  const todos = new TodosPage(page)
  await page.goto('/todos')
  await test.step('Add a titled todo and see it in the list', async () => {
    await todos.create('Buy milk')
    await expect(page.getByRole('listitem')).toContainText('Buy milk')
  })
})
```

Step titles describe outcomes, not `click getByRole`.

## Auth

Reuse the repo's storageState / login helper. Do not click through signup in every test if a seed user exists.

MSW does **not** replace this job. Do not start an MSW worker in Playwright for the app's own API. Exception: a third-party HTTP call you cannot stand up in CI — then isolate it and document why.

## Run

Repo script (`test:e2e` or `playwright test`). Fix flakes with locators and `expect` auto-wait, not `waitForTimeout`.

## Exit

- [ ] POM for shared UI
- [ ] Steps readable in the HTML report
- [ ] One negative case
- [ ] Command green locally

import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

/** Preview runs with NODE_ENV=production; sealSession requires a real secret. */
const e2eSessionSecret =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : 'e2e-playwright-session-secret-min-16'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(isCI ? {} : { channel: 'chrome' as const }),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    // Do not reuse a local `dev` server — it hides production SESSION_SECRET failures.
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      SESSION_SECRET: e2eSessionSecret,
    },
  },
})

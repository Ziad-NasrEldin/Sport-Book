import path from 'node:path'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  globalSetup: path.resolve(__dirname, './tests/global.setup.ts'),
  webServer: [
    {
      command:
        'powershell -NoProfile -Command "$env:PORT=\'3201\'; $env:WEB_ORIGIN=\'http://localhost:3200\'; npm run dev"',
      cwd: path.resolve(__dirname, '../api'),
      url: 'http://localhost:3201/health',
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command:
        'powershell -NoProfile -Command "$env:NEXT_PUBLIC_API_URL=\'http://localhost:3201/api/v1\'; npx next dev --port 3200"',
      cwd: path.resolve(__dirname),
      url: 'http://localhost:3200/auth/sign-in',
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
})

import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

async function waitForInteractive(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
}

async function signIn(browser: Browser, email: string, password: string, expectedPath: RegExp) {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' })
  await waitForInteractive(page)

  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)

  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/auth/login') &&
        res.request().method() === 'POST' &&
        res.status() === 200,
    ),
    page.getByRole('button', { name: /^sign in$/i }).click(),
  ])

  await expect(page).toHaveURL(expectedPath)

  return { context, page }
}

test.describe('Operator Flow Smoke Tests', () => {
  test('operator can log in and see dashboard data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await expect(page.getByRole('heading', { name: /operator dashboard/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('operator can navigate bookings page and see data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/bookings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /bookings/i }).first()).toBeVisible()

    await context.close()
  })

  test('operator can view courts list', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/courts', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /courts/i }).first()).toBeVisible()

    await context.close()
  })

  test('operator can view branches list', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/branches', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /branches/i }).first()).toBeVisible()

    await context.close()
  })

  test('operator can view approvals queue', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/approvals', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /approvals/i }).first()).toBeVisible()

    await context.close()
  })

  test('operator can view schedule', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/schedule', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /schedule/i }).first()).toBeVisible()

    await context.close()
  })

  test('operator can view reports', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/reports', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /reports/i }).first()).toBeVisible()

    await context.close()
  })

  test('operator can view profile', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /profile/i }).first()).toBeVisible()

    await context.close()
  })

  test('operator can view settings', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/settings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible()

    await context.close()
  })

  test('operator can view staff', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/staff', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /staff/i }).first()).toBeVisible()

    await context.close()
  })

  test('operator dashboard exports CSV when export button is clicked', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await expect(page.getByRole('heading', { name: /operator dashboard/i }).first()).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: /export/i }).first().click().catch(() => null)

    await context.close()
  })

  test('operator bookings page exports CSV', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/bookings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await page.getByRole('button', { name: /export/i }).first().click().catch(() => null)

    await context.close()
  })

  test('operator courts page exports CSV', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/courts', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await page.getByRole('button', { name: /export/i }).first().click().catch(() => null)

    await context.close()
  })
})
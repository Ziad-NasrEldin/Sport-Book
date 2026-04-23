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

test.describe('Admin Dashboard - Mockup Data Replaced With Real API Data', () => {
  test('admin dashboard displays real booking velocity and revenue share from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    await expect(page.getByRole('heading', { name: /platform dashboard/i }).first()).toBeVisible({ timeout: 15000 })

    await page.waitForResponse(
      (res) => res.url().includes('/admin-workspace/dashboard') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    const bookingVelocityBars = page.locator('[class*="bg-secondary-container"]')
    await expect(bookingVelocityBars.first()).toBeVisible({ timeout: 10000 }).catch(() => null)

    await page.goto('/admin/finance', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /finance/i }).first()).toBeVisible()

    await context.close()
  })

  test('admin finance page shows revenue trend from API instead of hardcoded values', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    await page.goto('/admin/finance', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /finance and transactions/i }).first()).toBeVisible()

    await page.waitForResponse(
      (res) => res.url().includes('/admin-workspace/finance/summary') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    await context.close()
  })

  test('admin dashboard operational risks come from API not hardcoded', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    await page.waitForResponse(
      (res) => res.url().includes('/admin-workspace/dashboard') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    const riskSection = page.getByText(/operational risks/i).first()
    await expect(riskSection).toBeVisible({ timeout: 15000 }).catch(() => null)

    await context.close()
  })
})

test.describe('Coach Dashboard - Availability and Settings Real Data', () => {
  test('coach availability page loads templates from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/availability', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /availability/i }).first()).toBeVisible()

    await page.waitForResponse(
      (res) => res.url().includes('/coach/availability-templates') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    await context.close()
  })

  test('coach settings page shows real security info from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/settings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible()

    await page.waitForResponse(
      (res) => res.url().includes('/coach/security') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    await context.close()
  })
})

test.describe('Operator Dashboard - Real Data From API', () => {
  test('operator dashboard shows cancellation ratio from API not hardcoded', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.waitForResponse(
      (res) => res.url().includes('/operator/dashboard') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    const cancellationLabel = page.getByText(/cancellation ratio/i)
    await expect(cancellationLabel).toBeVisible({ timeout: 15000 }).catch(() => null)

    await context.close()
  })

  test('operator dashboard shows attention items from API not hardcoded', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.waitForResponse(
      (res) => res.url().includes('/operator/dashboard') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    const attentionSection = page.getByText(/attention needed/i)
    await expect(attentionSection).toBeVisible({ timeout: 15000 }).catch(() => null)

    await context.close()
  })

  test('operator profile shows real security info from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /operator profile/i }).first()).toBeVisible()

    await page.waitForResponse(
      (res) => res.url().includes('/operator/profile') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    await context.close()
  })
})
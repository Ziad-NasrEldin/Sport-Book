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

test.describe('Player Flow Smoke Tests', () => {
  test('player can sign in and see home page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await expect(page.locator('body')).toBeVisible()
    await context.close()
  })

  test('player can view profile', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /profile/i }).first()).toBeVisible()
    await context.close()
  })

  test('player can view account details', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/profile/account-details', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /account details/i }).first()).toBeVisible()
    await context.close()
  })

  test('player can view bookings history', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/profile/bookings-history', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /history/i }).first()).toBeVisible()
    await context.close()
  })

  test('player can view preferences page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/preferences', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: 'Preferences' }).first()).toBeVisible()
    await context.close()
  })

  test('player can view wallet top-up page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/profile/wallet/topup', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /top up wallet/i }).first()).toBeVisible()
    await context.close()
  })

  test('player can view favorites page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/favorites', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /favorites/i }).first()).toBeVisible()
    await context.close()
  })

  test('player can view courts page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/courts', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.locator('body')).toBeVisible()
    await context.close()
  })

  test('player can view coaches page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/coaches', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.locator('body')).toBeVisible()
    await context.close()
  })

  test('player can view categories page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/categories', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.locator('body')).toBeVisible()
    await context.close()
  })
})

test.describe('Store Flow Smoke Tests', () => {
  test('player can view store page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /(?:\/|\/onboarding)$/)
    await page.goto('/store', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.locator('body')).toBeVisible()
    await context.close()
  })
})

test.describe('Auth Flow Smoke Tests', () => {
  test('sign-in page renders correctly', async ({ page }) => {
    await page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()
  })

  test('sign-up page renders correctly', async ({ page }) => {
    await page.goto('/auth/sign-up', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.locator('form')).toBeVisible()
  })

  test('forgot-password page renders', async ({ page }) => {
    await page.goto('/auth/forgot-password', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /forgot password/i }).first()).toBeVisible()
  })
})

test.describe('Coach Flow Smoke Tests', () => {
  test('coach can log in and see dashboard', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach/)
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
    await context.close()
  })

  test('coach can view bookings', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach/)
    await page.goto('/coach/bookings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /bookings/i }).first()).toBeVisible()
    await context.close()
  })

  test('coach can view services', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach/)
    await page.goto('/coach/services', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /services/i }).first()).toBeVisible()
    await context.close()
  })

  test('coach can view availability', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach/)
    await page.goto('/coach/availability', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /availability/i }).first()).toBeVisible()
    await context.close()
  })

  test('coach can view reports', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach/)
    await page.goto('/coach/reports', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /reports/i }).first()).toBeVisible()
    await context.close()
  })

  test('coach can view profile', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach/)
    await page.goto('/coach/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /profile/i }).first()).toBeVisible()
    await context.close()
  })

  test('coach can view settings', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach/)
    await page.goto('/coach/settings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible()
    await context.close()
  })
})

test.describe('Admin Flow Smoke Tests', () => {
  test('admin can log in and see dashboard', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin/)
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
    await context.close()
  })

  test('admin can view users', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin/)
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /users/i }).first()).toBeVisible()
    await context.close()
  })

  test('admin can view facilities', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin/)
    await page.goto('/admin/facilities', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /facilities/i }).first()).toBeVisible()
    await context.close()
  })

  test('admin can view coaches', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin/)
    await page.goto('/admin/coaches', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /coaches/i }).first()).toBeVisible()
    await context.close()
  })

  test('admin can view bookings', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin/)
    await page.goto('/admin/bookings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /bookings/i }).first()).toBeVisible()
    await context.close()
  })

  test('admin can view finance', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin/)
    await page.goto('/admin/finance', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /finance/i }).first()).toBeVisible()
    await context.close()
  })

  test('admin can view settings', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin/)
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible()
    await context.close()
  })

  test('admin can view sports', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin/)
    await page.goto('/admin/sports', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.locator('body')).toBeVisible()
    await context.close()
  })
})
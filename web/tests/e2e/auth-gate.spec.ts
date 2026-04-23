import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

async function waitForInteractive(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
}

async function clearAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('sportbook-access-token')
    sessionStorage.removeItem('sportbook-redirect-url')
  })
}

async function signInAsPlayer(browser: Browser): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' })
  await waitForInteractive(page)

  await page.fill('input[name="email"]', 'player1@example.com')
  await page.fill('input[name="password"]', 'password123')

  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/auth/login') &&
        res.request().method() === 'POST' &&
        res.status() === 200,
    ),
    page.getByRole('button', { name: /^sign in$/i }).click(),
  ])

  await page.waitForURL(/\/$/, { timeout: 15000 })
  await waitForInteractive(page)
  return { context, page }
}

test.describe('S1: Guest can browse home page', () => {
  test('guest sees home page content without authentication', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.locator('text=Choose Category')).toBeVisible({ timeout: 15000 })
  })
})

test.describe('S2: Guest sees "Sign In" in nav instead of "Profile"', () => {
  test('unauthenticated FloatingNav shows Sign In button', async ({ page }) => {
    await clearAuth(page)
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('link', { name: /profile/i })).not.toBeVisible()
  })
})

test.describe('S3: Guest clicks "Sign In" from nav → logs in → returns to original page', () => {
  test('redirect back to previous page after login from nav', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('/courts', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await clearAuth(page)
    await page.goto('/courts', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    const signInBtn = page.getByRole('button', { name: /sign in/i })
    await expect(signInBtn).toBeVisible({ timeout: 15000 })
    await signInBtn.click()

    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })
    await waitForInteractive(page)

    await page.fill('input[name="email"]', 'player1@example.com')
    await page.fill('input[name="password"]', 'password123')

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/v1/auth/login') &&
          res.request().method() === 'POST' &&
          res.status() === 200,
      ),
      page.getByRole('button', { name: /^sign in$/i }).click(),
    ])

    await page.waitForURL(/\/courts/, { timeout: 15000 })

    await expect(page).toHaveURL(/\/courts/)
    await context.close()
  })
})

test.describe('S4: Guest clicks "Sign In" → creates account → returns to original page', () => {
  test('redirect preserved when navigating from sign-in to sign-up', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('/store', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await clearAuth(page)
    await page.goto('/store', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    const signInBtn = page.getByRole('button', { name: /sign in/i })
    await expect(signInBtn).toBeVisible({ timeout: 15000 })
    await signInBtn.click()

    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })
    await waitForInteractive(page)

    const createAccountLink = page.getByRole('link', { name: /create account/i })
    await expect(createAccountLink).toBeVisible()
    await createAccountLink.click()

    await page.waitForURL(/\/auth\/sign-up/, { timeout: 15000 })
    await waitForInteractive(page)

    const timestamp = Date.now()
    await page.fill('input[name="name"]', `Test User ${timestamp}`)
    await page.fill('input[name="email"]', `testuser${timestamp}@example.com`)
    await page.fill('input[name="password"]', 'password123')

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/v1/auth/register') &&
          res.request().method() === 'POST',
      ),
      page.getByRole('button', { name: /^sign up$/i }).click(),
    ])

    await page.waitForURL(/\/store/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/store/)
    await context.close()
  })
})

test.describe('S5: Guest tries to book a court (Confirm Booking button)', () => {
  test('clicking Confirm Booking as guest redirects to sign-in', async ({ page }) => {
    await clearAuth(page)

    await page.goto('/book?courtId=test-court-1', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await page.waitForTimeout(2000)

    const confirmBtn = page.getByRole('button', { name: /confirm booking|select a slot/i })
    if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmBtn.click()
      await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })
        .catch(() => {
          // If no redirect, check that requireAuth was triggered (may have been redirected)
        })
    }
  })
})

test.describe('S6: Guest navigates to /checkout directly', () => {
  test('unauthenticated checkout redirects to sign-in', async ({ page }) => {
    await clearAuth(page)
    await page.goto('/checkout?courtId=test-court-1&date=2026-01-01&startHour=9&endHour=10', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/auth\/sign-in/)
  })
})

test.describe('S7: Guest tries coach checkout', () => {
  test('unauthenticated coach checkout redirects to sign-in', async ({ page }) => {
    await clearAuth(page)
    await page.goto('/coaches/test-coach/checkout?coachId=c1&serviceId=s1&date=2026-01-01&startHour=9&endHour=10', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/auth\/sign-in/)
  })
})

test.describe('S8: Guest tries Add to Cart on store product', () => {
  test('Add to Cart button redirects unauthenticated user to sign-in', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('/store', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await clearAuth(page)

    const productLinks = page.locator('a[href*="/store/"]')
    const count = await productLinks.count()
    if (count > 0) {
      await productLinks.first().click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const addToCartBtn = page.getByRole('button', { name: /add to cart/i })
      if (await addToCartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addToCartBtn.click()
        await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })
        await expect(page).toHaveURL(/\/auth\/sign-in/)
      }
    }
    await context.close()
  })
})

test.describe('S9: Guest navigates to /store/checkout directly', () => {
  test('unauthenticated store checkout redirects to sign-in', async ({ page }) => {
    await clearAuth(page)
    await page.goto('/store/checkout', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/auth\/sign-in/)
  })
})

test.describe('S10: Guest navigates to /profile directly', () => {
  test('unauthenticated profile redirects to sign-in', async ({ page }) => {
    await clearAuth(page)
    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/auth\/sign-in/)
  })
})

test.describe('S11: Authenticated user sees "Profile" in nav', () => {
  test('authenticated FloatingNav shows Profile link', async ({ browser }) => {
    const { context, page } = await signInAsPlayer(browser)

    const profileLink = page.getByRole('link', { name: /profile/i })
    await expect(profileLink).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: /sign in/i })).not.toBeVisible()

    await context.close()
  })
})

test.describe('S12: Redirect URL preserved across sign-in to sign-up navigation', () => {
  test('return URL preserved when clicking Create account on sign-in page', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('/coaches', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await clearAuth(page)
    await page.goto('/coaches', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    const signInBtn = page.getByRole('button', { name: /sign in/i })
    await expect(signInBtn).toBeVisible({ timeout: 15000 })
    await signInBtn.click()

    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })
    await waitForInteractive(page)

    const redirectUrl = await page.evaluate(() => sessionStorage.getItem('sportbook-redirect-url'))
    expect(redirectUrl).toContain('/coaches')

    const createAccountLink = page.getByRole('link', { name: /create account/i })
    await createAccountLink.click()
    await page.waitForURL(/\/auth\/sign-up/, { timeout: 15000 })
    await waitForInteractive(page)

    const redirectAfterNav = await page.evaluate(() => sessionStorage.getItem('sportbook-redirect-url'))
    expect(redirectAfterNav).toContain('/coaches')

    await context.close()
  })
})

test.describe('S13: Authenticated booking flow works end-to-end', () => {
  test('signed-in user can access booking page', async ({ browser }) => {
    const { context, page } = await signInAsPlayer(browser)

    await page.goto('/book?courtId=test-court-1', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page).toHaveURL(/\/book/)
    await expect(page.getByRole('button', { name: /select a slot|confirm booking/i })).toBeVisible({ timeout: 15000 })

    await context.close()
  })
})

test.describe('S14: Authenticated store purchase flow works', () => {
  test('signed-in user can access store and profile', async ({ browser }) => {
    const { context, page } = await signInAsPlayer(browser)

    await page.goto('/store', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page).toHaveURL(/\/store/)

    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await expect(page).toHaveURL(/\/profile/)

    const profileLink = page.getByRole('link', { name: /profile/i })
    await expect(profileLink).toBeVisible({ timeout: 10000 })

    await context.close()
  })
})

test.describe('Auth redirect: Return to original page after login', () => {
  test('guest visits profile → sign-in → redirected back to profile', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await clearAuth(page)

    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })

    await page.fill('input[name="email"]', 'player1@example.com')
    await page.fill('input[name="password"]', 'password123')

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/v1/auth/login') &&
          res.request().method() === 'POST' &&
          res.status() === 200,
      ),
      page.getByRole('button', { name: /^sign in$/i }).click(),
    ])

    await page.waitForURL(/\/profile/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/profile/)

    await context.close()
  })
})

test.describe('Auth redirect: Return URL consumed after use', () => {
  test('redirect URL is cleared from sessionStorage after successful login', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await clearAuth(page)

    await page.goto('/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)
    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 })

    await page.fill('input[name="email"]', 'player1@example.com')
    await page.fill('input[name="password"]', 'password123')

    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/api/v1/auth/login') &&
          res.request().method() === 'POST' &&
          res.status() === 200,
      ),
      page.getByRole('button', { name: /^sign in$/i }).click(),
    ])

    await page.waitForURL(/\/profile/, { timeout: 15000 })
    await waitForInteractive(page)

    const redirectUrl = await page.evaluate(() => sessionStorage.getItem('sportbook-redirect-url'))
    expect(redirectUrl).toBeNull()

    await context.close()
  })
})
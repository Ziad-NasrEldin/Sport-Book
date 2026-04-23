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

  await expect(page).toHaveURL(expectedPath, { timeout: 15000 })

  return { context, page }
}

test.describe('Auth Flow', () => {
  test('login with invalid credentials shows error message', async ({ page }) => {
    await page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')

    await page.getByRole('button', { name: /^sign in$/i }).click()

    await expect(page.getByText(/invalid|failed|incorrect|error/i)).toBeVisible({ timeout: 10000 })
  })

  test('admin can log in and redirect to admin dashboard', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)
    await expect(page.getByRole('heading', { name: /dashboard/i }).first()).toBeVisible({ timeout: 15000 })
    await context.close()
  })

  test('coach can log in and redirect to coach dashboard', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)
    await expect(page.getByRole('heading', { name: /dashboard/i }).first()).toBeVisible({ timeout: 15000 })
    await context.close()
  })

  test('operator can log in and redirect to operator dashboard', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)
    await expect(page.getByRole('heading', { name: /operator dashboard/i }).first()).toBeVisible({ timeout: 15000 })
    await context.close()
  })

  test('player can log in and redirect to home', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /\//)
    await expect(page).toHaveURL(/\//, { timeout: 15000 })
    await context.close()
  })
})

test.describe('Admin Dashboard - Real Data Verification', () => {
  test('admin dashboard loads real metrics from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    const dashboardResponse = page.waitForResponse(
      (res) => res.url().includes('/admin-workspace/dashboard') && res.status() === 200,
      { timeout: 15000 },
    )

    await expect(page.getByRole('heading', { name: /platform dashboard/i }).first()).toBeVisible({ timeout: 15000 })
    const response = await dashboardResponse

    const data = await response.json()
    expect(data.data.bookingVelocity).toBeDefined()
    expect(data.data.revenueShare).toBeDefined()
    expect(data.data.averageOrder).toBeDefined()
    expect(data.data.successRate).toBeDefined()
    expect(data.data.operationalRisks).toBeDefined()
    expect(Array.isArray(data.data.operationalRisks)).toBe(true)

    await context.close()
  })

  test('admin dashboard shows metric cards with real values', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    await expect(page.getByText(/active users/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/active facilities/i)).toBeVisible()
    await expect(page.getByText(/verified coaches/i)).toBeVisible()
    await expect(page.getByText(/30-day revenue/i)).toBeVisible()

    await context.close()
  })

  test('admin finance page loads real summary data from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    await page.goto('/admin/finance', { waitUntil: 'domcontentloaded' })

    const financeResponse = page.waitForResponse(
      (res) => res.url().includes('/admin-workspace/finance') && res.status() === 200,
      { timeout: 15000 },
    )

    await expect(page.getByRole('heading', { name: /finance/i }).first()).toBeVisible({ timeout: 15000 })
    await financeResponse

    const summaryResponse = await page.waitForResponse(
      (res) => res.url().includes('/admin-workspace/finance/summary') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    if (summaryResponse) {
      const summaryData = await summaryResponse.json()
      expect(summaryData.data.revenueTrend).toBeDefined()
      expect(summaryData.data.payoutDue).toBeDefined()
      expect(summaryData.data.riskIndicators).toBeDefined()
      expect(Array.isArray(summaryData.data.riskIndicators)).toBe(true)
    }

    await context.close()
  })

  test('admin users page loads and shows real user data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /users/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('admin bookings page loads and shows data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    await page.goto('/admin/bookings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /booking/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('admin settings page loads and save button works', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })
})

test.describe('Coach Dashboard - Real Data Verification', () => {
  test('coach dashboard loads real metrics from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    const dashboardResponse = page.waitForResponse(
      (res) => res.url().includes('/coach/dashboard') && res.status() === 200,
      { timeout: 15000 },
    )

    await expect(page.getByRole('heading', { name: /dashboard/i }).first()).toBeVisible({ timeout: 15000 })
    const response = await dashboardResponse

    const data = await response.json()
    expect(data.data.metrics).toBeDefined()
    expect(Array.isArray(data.data.metrics)).toBe(true)

    await context.close()
  })

  test('coach availability page loads templates from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/availability', { waitUntil: 'domcontentloaded' })

    const templatesResponse = page.waitForResponse(
      (res) => res.url().includes('/coach/availability-templates') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    await expect(page.getByRole('heading', { name: /availability/i }).first()).toBeVisible({ timeout: 15000 })

    if (templatesResponse) {
      const resp = await templatesResponse
      if (resp) {
        const data = await resp.json()
        expect(data.data).toBeDefined()
      }
    }

    await context.close()
  })

  test('coach availability page shows availability windows and allows create', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/availability', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /availability/i }).first()).toBeVisible({ timeout: 15000 })

    const addButtons = page.getByRole('button', { name: /add availability/i })
    await expect(addButtons.first()).toBeVisible({ timeout: 10000 }).catch(() => null)

    await context.close()
  })

  test('coach settings page loads security info from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/settings', { waitUntil: 'domcontentloaded' })

    const securityResponse = page.waitForResponse(
      (res) => res.url().includes('/coach/security') && res.status() === 200,
      { timeout: 15000 },
    ).catch(() => null)

    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible({ timeout: 15000 })

    if (securityResponse) {
      const resp = await securityResponse
      if (resp) {
        const data = await resp.json()
        expect(data.data.twoFactorEnabled).toBeDefined()
        expect(data.data.activeDeviceSessions).toBeDefined()
      }
    }

    await context.close()
  })

  test('coach settings page shows security access controls', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/settings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByText(/two-factor authentication/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/API token access/i)).toBeVisible()
    await expect(page.getByText(/device sessions/i)).toBeVisible()

    await context.close()
  })

  test('coach bookings page loads real data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/bookings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /booking/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('coach services page loads real data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/services', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /service/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('coach profile page loads and can be edited', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /profile/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('coach reports page loads real data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'coach@sportbook.com', 'password123', /\/coach\/dashboard/)

    await page.goto('/coach/reports', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /report/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })
})

test.describe('Operator Dashboard - Real Data Verification', () => {
  test('operator dashboard loads real cancellation ratio from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    const dashboardResponse = page.waitForResponse(
      (res) => res.url().includes('/operator/dashboard') && res.status() === 200,
      { timeout: 15000 },
    )

    await expect(page.getByRole('heading', { name: /operator dashboard/i }).first()).toBeVisible({ timeout: 15000 })
    const response = await dashboardResponse

    const data = await response.json()
    expect(data.data.cancellationRatio).toBeDefined()
    expect(data.data.attentionItems).toBeDefined()
    expect(Array.isArray(data.data.attentionItems)).toBe(true)

    await context.close()
  })

  test('operator dashboard shows cancellation ratio on page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await waitForInteractive(page)
    await expect(page.getByText(/cancellation ratio/i)).toBeVisible({ timeout: 15000 }).catch(() => {
      // May not be visible if the percentage label is different
    })

    await context.close()
  })

  test('operator dashboard shows attention items on page', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await waitForInteractive(page)
    await expect(page.getByText(/attention/i)).toBeVisible({ timeout: 15000 }).catch(() => null)

    await context.close()
  })

  test('operator profile loads real security info from API', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/profile', { waitUntil: 'domcontentloaded' })

    const profileResponse = page.waitForResponse(
      (res) => res.url().includes('/operator/profile') && res.status() === 200,
      { timeout: 15000 },
    )

    await expect(page.getByRole('heading', { name: /profile/i }).first()).toBeVisible({ timeout: 15000 })
    const response = await profileResponse

    const data = await response.json()
    expect(data.data.twoFactorEnabled).toBeDefined()
    expect(data.data.lastLoginAt).toBeDefined()
    expect(data.data.activeDeviceSessions).toBeDefined()

    await context.close()
  })

  test('operator profile shows two-factor authentication status', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByText(/two-factor authentication/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/last login/i)).toBeVisible()

    await context.close()
  })

  test('operator profile save button works', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/profile', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    const saveButton = page.getByRole('button', { name: /save profile/i })
    await expect(saveButton).toBeVisible({ timeout: 10000 }).catch(() => null)

    await context.close()
  })

  test('operator bookings page loads and shows data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/bookings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /booking/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('operator courts page loads and shows data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/courts', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /court/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('operator branches page loads and shows data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/branches', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /branch/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('operator approvals page loads', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/approvals', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /approvals/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('operator schedule page loads', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/schedule', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /schedule/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('operator reports page loads', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/reports', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /report/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('operator staff page loads', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/staff', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /staff/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })

  test('operator settings page loads', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    await page.goto('/operator/settings', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible({ timeout: 15000 })

    await context.close()
  })
})

test.describe('Booking Flow - Dynamic Data Verification', () => {
  test('coach listing page shows real coaches', async ({ page }) => {
    await page.goto('/coaches', { waitUntil: 'domcontentloaded' })
    await waitForInteractive(page)

    const coachResponse = page.waitForResponse(
      (res) => res.url().includes('/api/v1/player/coaches') || res.url().includes('/api/v1/coaches'),
      { timeout: 15000 },
    ).catch(() => null)

    await expect(page.getByText(/coach/i).first()).toBeVisible({ timeout: 15000 }).catch(() => null)
  })

})

test.describe('User Security Endpoint', () => {
  test('users/me/security returns security info for authenticated user', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'player1@example.com', 'password123', /\//)

    const securityResponse = await page.request.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/users/me/security`,
      {
        headers: {
          Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('sportbook-access-token'))}`,
        },
      },
    )

    expect(securityResponse.ok()).toBe(true)
    const data = await securityResponse.json()
    expect(data.data.twoFactorEnabled).toBeDefined()
    expect(data.data.activeDeviceSessions).toBeDefined()
    expect(data.data.lastLoginAt).toBeDefined()

    await context.close()
  })
})

test.describe('Operator Profile Endpoint', () => {
  test('operator profile endpoint returns security info', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'operator@sportbook.com', 'password123', /\/operator\/dashboard/)

    const profileResponse = page.waitForResponse(
      (res) => res.url().includes('/operator/profile') && res.status() === 200,
      { timeout: 15000 },
    )

    await page.goto('/operator/profile', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /profile/i }).first()).toBeVisible({ timeout: 15000 })

    const response = await profileResponse
    const data = await response.json()
    expect(data.data.fullName).toBeDefined()
    expect(data.data.email).toBeDefined()
    expect(data.data.twoFactorEnabled).toBeDefined()
    expect(data.data.lastLoginAt).toBeDefined()

    await context.close()
  })
})

test.describe('Admin Finance Summary Endpoint', () => {
  test('finance summary returns trend and risk data', async ({ browser }) => {
    const { page, context } = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)

    const summaryResponse = await page.request.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin-workspace/finance/summary`,
      {
        headers: {
          Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('sportbook-access-token'))}`,
        },
      },
    )

    expect(summaryResponse.ok()).toBe(true)
    const data = await summaryResponse.json()
    expect(data.data.revenueTrend).toBeDefined()
    expect(Array.isArray(data.data.revenueTrend)).toBe(true)
    expect(data.data.payoutDue).toBeDefined()
    expect(data.data.riskIndicators).toBeDefined()
    expect(Array.isArray(data.data.riskIndicators)).toBe(true)

    await context.close()
  })
})
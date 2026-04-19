import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

async function waitForInteractiveForm(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(750)
}

async function signIn(browser: Browser, email: string, password: string, expectedPath: RegExp) {
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('/auth/sign-in', { waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(page)

  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/auth/login') && response.request().method() === 'POST' && response.status() === 200,
    ),
    page.getByRole('button', { name: /^sign in$/i }).click(),
  ])

  await expect(page).toHaveURL(expectedPath)

  return { context, page }
}

async function submitFacilityRequest(page: Page, facilityName: string) {
  await page.goto('/auth/send-request', { waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(page)

  await page.selectOption('select', 'facility')
  await page.fill('input[placeholder="\\+20 10 0000 0000"]', '+201000000000')
  await page.fill('input[placeholder="Cairo"]', 'Cairo')
  await page.fill('input[placeholder="Your venue or business name"]', facilityName)
  await page.fill('input[placeholder="Business registration ID"]', `REG-${Date.now()}`)
  await page.fill('input[placeholder="Street, district, city"]', 'Nasr City, Cairo')
  await page.fill('textarea', `Facility application for ${facilityName}. We run verified courts and need operator access.`)

  const [response] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/auth/send-request') &&
        response.request().method() === 'POST' &&
        response.status() === 200,
    ),
    page.getByRole('button', { name: /submit request/i }).click(),
  ])

  const payload = await response.json()
  return payload?.data?.id as string
}

async function getFirstVerificationLink(page: Page) {
  const link = page.locator('a[href^="/admin/verification/"]').first()
  await expect(link).toBeVisible()
  return (await link.getAttribute('href')) ?? ''
}

test('verification flow works end to end', async ({ browser }) => {
  const playerLandingPath = /(?:\/|\/onboarding)$/

  const playerOne = await signIn(browser, 'player1@example.com', 'password123', playerLandingPath)
  await submitFacilityRequest(playerOne.page, 'Player One Arena')

  await expect(playerOne.page.getByText('Request submitted successfully.')).toBeVisible()
  await expect(playerOne.page.getByText('Facility request')).toBeVisible()
  await expect(playerOne.page.getByText('Pending Review')).toBeVisible()
  await expect(
    playerOne.page.getByText(/you already have a pending role upgrade request/i),
  ).toBeVisible()
  await expect(playerOne.page.getByRole('button', { name: /submit request/i })).toBeDisabled()
  await playerOne.context.close()

  const adminDetail = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)
  await adminDetail.page.goto('/admin/verification', { waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(adminDetail.page)
  await expect(adminDetail.page.getByText('Verification Queue')).toBeVisible()

  const firstCaseHref = await getFirstVerificationLink(adminDetail.page)
  await adminDetail.page.goto(firstCaseHref, { waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(adminDetail.page)

  await adminDetail.page.getByRole('button', { name: /assign to me/i }).click()
  await expect(adminDetail.page.getByText('Current Admin')).toBeVisible()

  await adminDetail.page.getByRole('button', { name: /mark all verified/i }).click()
  await expect(adminDetail.page.getByText('4 / 4 checks verified')).toBeVisible()

  await adminDetail.page.fill('textarea', 'Need the final venue confirmation before approval.')
  await adminDetail.page.getByRole('button', { name: /add note/i }).click()
  await expect(adminDetail.page.getByText(/Need the final venue confirmation before approval\./)).toBeVisible()

  await adminDetail.page.getByRole('button', { name: /request info/i }).click()
  await expect(adminDetail.page.getByText('Needs Info')).toBeVisible()

  await adminDetail.page.reload({ waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(adminDetail.page)
  await expect(adminDetail.page.getByText('Current Admin')).toBeVisible()
  await expect(adminDetail.page.getByText('Needs Info')).toBeVisible()
  await expect(
    adminDetail.page.getByText(/Need the final venue confirmation before approval\./).first(),
  ).toBeVisible()

  await adminDetail.context.close()

  const playerOneReview = await signIn(browser, 'player1@example.com', 'password123', playerLandingPath)
  await playerOneReview.page.goto('/auth/send-request', { waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(playerOneReview.page)
  await expect(playerOneReview.page.getByText('Needs Info')).toBeVisible()
  await playerOneReview.context.close()

  const adminApprove = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)
  await adminApprove.page.goto(firstCaseHref, { waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(adminApprove.page)
  await adminApprove.page.getByRole('button', { name: /approve case/i }).click()
  await expect(adminApprove.page.getByText('Approved')).toBeVisible()

  await adminApprove.page.goto('/admin/audit', { waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(adminApprove.page)
  await expect(adminApprove.page.getByText('Verification Queue').first()).toBeVisible()
  await adminApprove.context.close()

  const playerOneApproved = await signIn(browser, 'player1@example.com', 'password123', /\/operator\/dashboard/)
  await expect(playerOneApproved.page.getByText('Operator Dashboard')).toBeVisible()
  await playerOneApproved.context.close()

  const playerTwo = await signIn(browser, 'player2@example.com', 'password123', playerLandingPath)
  const playerTwoRequestId = await submitFacilityRequest(playerTwo.page, 'Player Two Arena')
  await expect(playerTwo.page.getByText('Pending Review')).toBeVisible()

  const adminReject = await signIn(browser, 'admin@sportbook.com', 'password123', /\/admin\/dashboard/)
  await adminReject.page.goto(`/admin/verification/${playerTwoRequestId}`, { waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(adminReject.page)
  await adminReject.page.getByRole('button', { name: /reject case/i }).click()
  await expect(adminReject.page.getByText('Rejected')).toBeVisible()
  await adminReject.context.close()

  await playerTwo.page.goto('/auth/send-request', { waitUntil: 'domcontentloaded' })
  await waitForInteractiveForm(playerTwo.page)
  await expect(playerTwo.page.getByText('Rejected')).toBeVisible()
  await playerTwo.context.close()
})

import { chromium } from 'playwright';

const pages = [
  { path: '/profile/account-details', name: 'account-details' },
  { path: '/profile/wallet/topup', name: 'wallet-topup' },
  { path: '/profile/store-purchases', name: 'store-purchases' },
  { path: '/profile/bookings', name: 'bookings' },
  { path: '/profile/bookings-history', name: 'bookings-history' },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  // Authenticate
  const loginRes = await context.request.post('http://localhost:3001/api/v1/auth/login', {
    data: { email: 'player1@example.com', password: 'password123' }
  });
  const loginBody = await loginRes.json();
  const token = loginBody.data?.accessToken;

  if (!token) {
    console.log('Auth failed', loginBody);
    await browser.close();
    return;
  }

  const page = await context.newPage();
  await page.goto('http://localhost:3000/');
  await page.evaluate((t) => {
    localStorage.setItem('sportbook-access-token', t);
  }, token);

  for (const p of pages) {
    await page.goto(`http://localhost:3000${p.path}`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `profile-${p.name}.png`, fullPage: true });
    console.log(`Screenshot: ${p.name}`);
  }

  await browser.close();
})();
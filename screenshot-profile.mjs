import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  // Register via API request in this context (shares cookies)
  const response = await context.request.post('http://localhost:3001/api/v1/auth/register', {
    data: { email: 'player1@example.com', password: 'password123', name: 'Ahmed Mohamed' }
  });
  const body = await response.json();
  const accessToken = body.data?.accessToken;
  
  if (!accessToken) {
    // Maybe user already exists, try login
    const loginRes = await context.request.post('http://localhost:3001/api/v1/auth/login', {
      data: { email: 'player1@example.com', password: 'password123' }
    });
    const loginBody = await loginRes.json();
    const loginToken = loginBody.data?.accessToken;
    if (!loginToken) {
      console.log('Auth failed', loginBody);
      await browser.close();
      return;
    }
  }
  
  const token = accessToken || (await (await context.request.post('http://localhost:3001/api/v1/auth/login', {
    data: { email: 'player1@example.com', password: 'password123' }
  })).json()).data?.accessToken;

  const page = await context.newPage();
  // Set localStorage token
  await page.goto('http://localhost:3000/');
  await page.evaluate((t) => {
    localStorage.setItem('sportbook-access-token', t);
  }, token);
  
  // Now go to profile
  await page.goto('http://localhost:3000/profile');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'profile-after.png', fullPage: true });
  await browser.close();
})();
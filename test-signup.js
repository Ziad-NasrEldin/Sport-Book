const { chromium } = require('playwright');

(async () => {
  // Try ms (edge) channel
  const browser = await chromium.launch({ 
    headless: false,
    channel: 'ms',
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  await page.goto('http://localhost:3000/auth/sign-up');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'E:/GitHub/Sport-Book/signup-test.png' });
  
  console.log('Screenshot saved');
  await browser.close();
})();
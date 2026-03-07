const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(2000);

  await page.click('text=Join your campus');
  await page.waitForTimeout(2000);

  console.log("URL after clicking 'Join your campus':", page.url());

  await page.screenshot({ path: 'routing-test.png' });

  await page.click('text=or Log in');
  await page.waitForTimeout(2000);

  console.log("URL after clicking 'or Log in':", page.url());

  await browser.close();
})();

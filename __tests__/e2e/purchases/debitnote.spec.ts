import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('link', { name: 'Purchases' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('link', { name: 'Debit Notes' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
});

test('Can add new comment in a Debit note', async ({ page }) => {
  function generateRandomString(length = 10) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  const random = generateRandomString();

  await page.getByText('DBN/G0IO49/2425/0003').click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.getByPlaceholder('Type your comment here...').click();
  await page.getByPlaceholder('Type your comment here...').fill(random);
  await page.locator('svg.lucide-arrow-up.cursor-pointer').click();
  await expect(page.getByText(random, { exact: true })).toBeVisible();
});

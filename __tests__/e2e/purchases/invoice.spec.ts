import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('link', { name: 'Purchases' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('link', { name: 'Invoices' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
});

test('Can View Invoices', async ({ page }) => {
  await page.getByRole('cell', { name: 'INV/JVT2GH/2425/0010' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('INV/JVT2GH/2425/0010')).toBeVisible();

  await page.getByRole('tab', { name: 'Payment Advices' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('cell', { name: '85' })).toBeVisible();

  await page.getByRole('tab', { name: 'Debit Notes' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('DBN/G0IO49/2425/0002')).toBeVisible();
});

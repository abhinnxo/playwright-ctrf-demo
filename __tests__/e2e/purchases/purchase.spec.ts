import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page.getByRole('link', { name: 'Purchases' }).click();
});

test('Has Order', async ({ page }) => {
  await page.getByText('ORD/ZXZ0LT/2425/0001').click();
  await expect(page.getByText('ORD/ZXZ0LT/2425/0001')).toBeVisible();
  await expect(page.getByText('Aayush (B2B)')).toBeVisible();
});

test('Has Under Review', async ({ page }) => {
  await page.getByRole('tab', { name: 'Under Review' }).click();
  await page.getByText('ORD/ZXZ0LT/2425/0002').click();
  await expect(page.getByText('ORD/ZXZ0LT/2425/0002')).toBeVisible();
  await expect(page.getByText('Offer received')).toBeVisible();
});

test('Has Invoice', async ({ page }) => {
  await page.getByRole('link', { name: 'Invoices' }).click();
  await page.getByText('INV/ZXZ0LT/2425/0001').click({ timeout: 5000 });
  await expect(page.getByText('INV/ZXZ0LT/2425/0001')).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByText('Aayush (B2B)')).toBeVisible({ timeout: 5000 });
});

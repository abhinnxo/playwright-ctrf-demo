import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page.getByRole('link', { name: 'Catalogue' }).click({ timeout: 5000 });
});

test('Catalouge/ Search Exact Product Test - 1 @search', async ({ page }) => {
  // check if a product is listed on searching
  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('DummyProduct', { delay: 100 });
  await expect(page.getByText('DummyProduct')).toBeVisible({ timeout: 5000 });
});

test('Catalouge/ Search Exact Service Test @search', async ({ page }) => {
  // check if a service is listed on searching
  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('dummyservice', { delay: 100 });
  await expect(page.getByText('dummyservice')).toBeVisible({ timeout: 5000 });
});

test('Catalouge/ Search substring of Product Name Test @search', async ({
  page,
}) => {
  // check if a service is listed on searching
  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('mmyPro', { delay: 100 });
  await expect(page.getByText('DummyProduct')).toBeVisible({ timeout: 5000 });
});
test('Catalouge/ Search manufacturer Name of a Product Test - 1 @search', async ({
  page,
}) => {
  // check if a service is listed on searching
  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('Nutella', { delay: 100 });
  await expect(page.getByText('DummyProduct')).toBeVisible({ timeout: 5000 });
});

test('Catalogue/  Empty input should return all results @search', async ({
  page,
}) => {
  const search = page.getByPlaceholder('Search...');
  await search.fill('');
  await expect(page.getByText('DummyProduct')).toBeVisible();
  await expect(page.getByText('dummyservice')).toBeVisible();
});

test('Catalogue/  Whitespace-only input should return no results @search', async ({
  page,
}) => {
  const search = page.getByPlaceholder('Search...');
  await search.fill('     ');
  await page.waitForTimeout(500); // wait for debounce if present
  await expect(page.getByText('DummyProduct')).not.toBeVisible();
  await expect(page.getByText('No results.')).toBeVisible(); // Adjust based on app
});

test('Catalogue/  Special characters input returns no results @search', async ({
  page,
}) => {
  const search = page.getByPlaceholder('Search...');
  await search.fill('!@#$%^&*()');
  await page.waitForTimeout(500);
  await expect(page.getByText('DummyProduct')).not.toBeVisible();
  await expect(page.getByText('No results.')).toBeVisible();
});

test('Catalogue/ Long string input returns no results @search', async ({
  page,
}) => {
  const longInput = 'x'.repeat(300);
  const search = page.getByPlaceholder('Search...');
  await search.fill(longInput);
  await page.waitForTimeout(500);
  await expect(page.getByText('DummyProduct')).not.toBeVisible();
  await expect(page.getByText('No results.')).toBeVisible();
});

test('Catalogue/ Rapid typing and deletion triggers debounce @search', async ({
  page,
}) => {
  const search = page.getByPlaceholder('Search...');

  await search.type('Dummy', { delay: 30 });
  await search.press('Backspace');
  await search.press('Backspace');
  await search.type('myProduct', { delay: 30 });

  await page.waitForTimeout(500);

  await expect(page.getByText('DummyProduct')).toBeVisible();

  await search.fill('');
  await page.waitForTimeout(500);
  await expect(page.getByText('DummyProduct')).toBeVisible();
});

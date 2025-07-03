import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page
    .getByRole('link', { name: 'Item Master' })
    .click({ timeout: 5000 });
});

test('Item Master/ Search existing Good by full name  Test @search', async ({
  page,
}) => {
  await page.getByPlaceholder('Search...').click({ timeout: 5000 });
  await page.keyboard.type('DummyProduct', { delay: 100 });
  await expect(page.getByText('DummyProduct')).toBeVisible({ timeout: 5000 });
});

test('Item Master/ Search existing Good by a single word Test @search', async ({
  page,
}) => {
  await page.getByPlaceholder('Search...').click({ timeout: 5000 });
  await page.keyboard.type('62f590d2', { delay: 100 });
  await page.waitForTimeout(2000);
  await expect(page.getByText('TEST PRODUCT 62f590d2')).toBeVisible({
    timeout: 5000,
  });
});

test('Item Master/ Search existing Good by its substring Test @search', async ({
  page,
}) => {
  await page.getByPlaceholder('Search...').click({ timeout: 5000 });
  await page.keyboard.type('DUCT 62f59', { delay: 100 });
  await page.waitForTimeout(2000);
  await expect(page.getByText('TEST PRODUCT 62f590d2')).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByText('TEST PRODUCT aa3fb2b0')).not.toBeVisible({
    timeout: 5000,
  });
});

test('Item Master/ Search existing Service by its full name Test @search', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Services' }).click({ timeout: 5000 });
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('dummyservice', { delay: 100 });
  await expect(page.getByText('dummyservice')).toBeVisible({ timeout: 5000 });
});

test('Item Master/ Search existing Service by a single word @search', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Services' }).click({ timeout: 5000 });
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('88417b4e', { delay: 100 });
  await expect(page.getByText('Updated Service 88417b4e')).toBeVisible({
    timeout: 5000,
  });
});

test('Item Master/ Search existing Service by its substring @search', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Services' }).click({ timeout: 5000 });
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('vice 884', { delay: 100 });
  await expect(page.getByText('Updated Service 88417b4e')).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByText('Test Service 20280ac7')).not.toBeVisible({
    timeout: 5000,
  });
});

test('Item Master/ Empty input should return all results @search', async ({
  page,
}) => {
  const search = page.getByPlaceholder('Search...');
  await search.fill('');
  await expect(page.getByText('DummyProduct')).toBeVisible();
  await expect(page.getByText('TEST PRODUCT 62f590d2')).toBeVisible();
});

test('Item Master/ Whitespace-only input should return all results @search', async ({
  page,
}) => {
  const search = page.getByPlaceholder('Search...');
  await search.fill('    ');
  await expect(page.getByText('DummyProduct')).toBeVisible();
  await expect(page.getByText('No results found')).not.toBeVisible();
});

test('Item Master/ Special characters return no results @search', async ({
  page,
}) => {
  const search = page.getByPlaceholder('Search...');
  await search.fill('!@#$%^&*()');
  await expect(page.getByText('DummyProduct')).not.toBeVisible();
  await expect(page.getByText('No results.')).toBeVisible();
});

test('Search/ Long input should not crash or return results @search', async ({
  page,
}) => {
  const longString = 'a'.repeat(200);
  const search = page.getByPlaceholder('Search...');
  await search.fill(longString);
  await expect(page.getByText('DummyProduct')).not.toBeVisible();
  await expect(page.getByText('No results.')).toBeVisible();
});

test('Item Master/ Rapid typing and deletion Test @search', async ({
  page,
}) => {
  const search = page.getByPlaceholder('Search...');

  await search.type('DummyPro', { delay: 50 });
  await search.press('Backspace');
  await search.press('Backspace');
  await search.type('duct', { delay: 30 });

  await expect(page.getByText('DummyProduct')).toBeVisible();

  await search.fill('');
  await expect(page.getByText('DummyProduct')).toBeVisible();
});

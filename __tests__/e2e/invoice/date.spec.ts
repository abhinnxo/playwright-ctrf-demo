import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page.getByRole('link', { name: 'Sales' }).click();
  await page.getByRole('cell', { name: 'ORD/G0IO49/2526/0129' }).click();
  await page.getByRole('button', { name: 'Record Payment' }).click();
  await page
    .locator('div')
    .filter({ hasText: /^Invoice ID \*Select$/ })
    .getByRole('combobox')
    .click();
  await page.getByRole('option', { name: 'INV/G0IO49/2526/' }).click();
});

test("Can Pick Today's date for invoice", async ({ page }) => {
  await page
    .locator('div')
    .filter({ hasText: /^Payment Mode \*Select$/ })
    .getByRole('combobox')
    .click();
  await page.getByRole('option', { name: 'NEFT' }).click();
  await page.getByRole('textbox', { name: 'DD/MM/YYYY' }).click();
  await page.getByRole('option', { name: 'Choose Monday, May 26th,' }).click();
  await page.getByRole('combobox').filter({ hasText: 'Select' }).click();
  await page.getByRole('option', { name: 'Acc XXXXXXXXXX1111' }).click();
  await page.locator('input[name="amount"]').click();
  await page.locator('input[name="amount"]').fill('1');
  await page.getByRole('button', { name: 'Create' }).click();
});

test('Can Pick a future date for invoice', async ({ page }) => {
  await page
    .locator('div')
    .filter({ hasText: /^Payment Mode \*Select$/ })
    .getByRole('combobox')
    .click();
  await page.getByRole('option', { name: 'NEFT' }).click();
  await page.getByRole('textbox', { name: 'DD/MM/YYYY' }).click();
  await page.getByRole('combobox').nth(3).selectOption('December');
  await page
    .getByRole('option', { name: 'Choose Wednesday, December 31st,' })
    .click();
  await page.getByRole('combobox').filter({ hasText: 'Select' }).click();
  await page.getByRole('option', { name: 'Acc XXXXXXXXXX1111' }).click();
  await page.locator('input[name="amount"]').click();
  await page.locator('input[name="amount"]').fill('1');
  await page.getByRole('button', { name: 'Create' }).click();
  // await expect(page.getByRole('region', { name: 'Notifications alt+T' }).getByRole('listitem')).toBeVisible();
});

test('Can Pick a past date for invoice', async ({ page }) => {
  await page
    .locator('div')
    .filter({ hasText: /^Payment Mode \*Select$/ })
    .getByRole('combobox')
    .click();
  await page.getByRole('option', { name: 'NEFT' }).click();
  await page.getByRole('textbox', { name: 'DD/MM/YYYY' }).click();
  await page.getByRole('combobox').nth(3).selectOption('January');
  await page
    .getByRole('option', { name: 'Choose Sunday, January 26th,' })
    .click();
  await page.locator('input[name="amount"]').click();
  await page.locator('input[name="amount"]').fill('1');
  await page.getByRole('button', { name: 'Create' }).click();
});

test('Can not proceed without picking a date for invoice', async ({ page }) => {
  await page
    .locator('div')
    .filter({ hasText: /^Payment Mode \*Select$/ })
    .getByRole('combobox')
    .click();
  await page.getByRole('option', { name: 'NEFT' }).click();
  await page.locator('input[name="amount"]').click();
  await page.locator('input[name="amount"]').fill('1');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(
    page.getByText('*Required! Please select payment date'),
  ).toBeVisible();
});

test('Can not add -ve amount for invoice', async ({ page }) => {
  await page.locator('input[name="amount"]').click();
  await page.locator('input[name="amount"]').fill('-1');
  await page.getByRole('button', { name: 'Create' }).click();
});

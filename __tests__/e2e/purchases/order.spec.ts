import { test, expect } from '@playwright/test';
import fs from 'fs';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page.getByRole('link', { name: 'Purchases' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('link', { name: 'Orders' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
});

const getFormattedDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const yyyy = today.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

const todaysDate = getFormattedDate();

test('Check all tabs are visible', async ({ page }) => {
  // All tab
  await page.getByRole('tab', { name: 'All' }).click();
  await expect(
    page.getByRole('cell', { name: 'ORD/JVT2GH/2425/0008' }),
  ).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');

  // Under Review Tab
  await page.getByRole('tab', { name: 'Under Review' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('ORD/ZXZ0LT/2425/0002')).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Withdrawn' }).nth(1),
  ).toBeVisible();

  // Confirmend Orders Tab
  await page.getByRole('tab', { name: 'Confirmed Orders' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('ORD/ZXZ0LT/2425/')).toBeVisible();
  await expect(page.getByText('Accepted')).toBeVisible();

  // Payables Tab
  await page.getByRole('tab', { name: 'Payables' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await expect(
    page.getByRole('cell', { name: 'ORD/JVT2GH/2425/0008' }),
  ).toBeVisible();

  // Unconfirmed Tab
  await page.getByRole('tab', { name: 'Unconfirmed' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await expect(
    page.getByRole('heading', { name: 'Simplify purchasing: from' }),
  ).toBeVisible();
});

test('Can Bid', async ({ page }) => {
  await page.getByRole('button', { name: 'Bid' }).click();

  await page.locator('.select__input-container').first().click();
  await page.getByRole('option', { name: 'Aayush' }).click();
  await page
    .locator(
      'div:nth-child(2) > div:nth-child(2) > .max-w-xs > .select__control > .select__value-container > .select__input-container',
    )
    .click();
  await page.getByRole('option', { name: 'Goods' }).click();
  await page
    .locator(
      'div:nth-child(3) > div > div > div > .css-b62m3t-container > .css-457jp6-control > .css-hlgwow > .css-19bb58m',
    )
    .click();
  await page.getByRole('option', { name: 'bottle' }).click();
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('1');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await expect(
    page.getByRole('cell', { name: todaysDate }).first(),
  ).toBeVisible();

  // clean up - delete newly created entry
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('td:nth-child(7)').first().click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
});

test('Can Filter results', async ({ page }) => {
  await page.getByRole('button', { name: 'Filter' }).click();
  await page.locator('.flex > .grid > div').first().click();
  await page.getByLabel('Choose Saturday, March 1st,').click();
  await page.locator('.grid > div:nth-child(2)').first().click();
  await page.getByLabel('Choose Saturday, March 1st,').click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await expect(
    page.getByRole('cell', { name: 'ORD/ZXZ0LT/2425/' }),
  ).toBeVisible();
});

test('Can Export selected Rows', async ({ page }) => {
  await page
    .getByRole('row', {
      name: 'Select row ORD/JVT2GH/2425/0008 25-03-2025 Kamlapuri Company Invoiced Payment',
    })
    .getByLabel('Select row')
    .click();

  // wait for download event
  const downloadPromise = page.waitForEvent('download');
  await page.locator('button:has(svg.lucide-upload)').click();
  // Wait for the download to complete
  const download = await downloadPromise;

  // Ensure the file has been downloaded
  expect(download.suggestedFilename()).toContain('.xlsx');

  // Save the file locally
  const filePath = `./e/Download/${download.suggestedFilename()}`;
  await download.saveAs(filePath);

  // Read the file contents
  const content = fs.readFileSync(filePath, 'utf-8').trim();

  // Ensure the file has data (not just headers)
  expect(content).not.toBe('');
  expect(content.split('\n').length).toBeGreaterThan(1); // More than just a header

  // Optionally, delete the file after the test
  fs.unlinkSync(filePath);
});

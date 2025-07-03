import { expect, test } from '@playwright/test';
import { randomUUID } from 'crypto'; // Node.js built-in module
import fs from 'fs';
import path from 'path';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page.waitForTimeout(2000);
  await page.getByText('Item Master').click({ timeout: 10000 });
  await page.waitForTimeout(2000);
});

test.describe.serial('Goods Management - CRUD', () => {
  const goodName = `Test Product ${randomUUID().substring(0, 8)}`;
  const updatedGoodName = `Updated Product ${randomUUID().substring(0, 8)}`;

  test('Can Add Good Test', async ({ page }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('combobox').click({ timeout: 50000 });
    await page.getByLabel('Goods').click();
    await page.getByLabel('Product Name *').click();
    await page.getByLabel('Product Name *').fill(goodName);
    await page.getByLabel("Manufacturer's Name *").click();
    await page.getByLabel("Manufacturer's Name *").fill('New Manufacture');
    await page.getByLabel('Description *').click();
    await page.getByLabel('Description *').fill('lorem ipsum');
    await page.getByLabel('HSN Code *').click();
    await page.getByLabel('HSN Code *').fill('1234');
    await page.getByLabel('Rate *').click();
    await page.getByLabel('Rate *').fill('1000');
    await page.getByLabel('GST (%) *').click();
    await page.getByLabel('GST (%) *').fill('18');
    await page.getByLabel('Quantity *').click();
    await page.getByLabel('Quantity *').fill('5');
    await page.getByLabel('Batch').click();
    await page.getByLabel('Batch').fill('20250227');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForTimeout(2000);
    await expect(
      page.getByRole('cell', { name: goodName }).first(),
    ).toBeVisible();
  });

  test('Can Edit Good Test', async ({ page }) => {
    await page.waitForURL(
      'https://hues-frontend-dev.vercel.app/en/inventory/goods',
    );
    await page.waitForTimeout(1000);

    // Locate the row that contains the specific goodName
    const itemRow = page.getByRole('row', { name: goodName });

    // Open the dropdown menu by clicking the three-dot button
    await itemRow.getByRole('button', { name: 'open menu' }).click();

    // click edit button
    const editButton = page.getByText('Edit');
    await editButton.waitFor({ state: 'visible' });
    await editButton.click();

    // Wait for the edit form to appear and verify pre-filled values
    await page.waitForSelector('form');
    await expect(page.getByLabel('Product Name *')).toHaveValue(goodName);
    await expect(page.getByLabel('Rate *')).toHaveValue('1000');

    // Update product name and rate
    await page.getByLabel('Product Name *').click();
    await page.getByLabel('Product Name *').fill(updatedGoodName);
    await page.getByLabel('Rate *').click();
    await page.getByLabel('Rate *').fill('1200');

    // Save changes
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(2000);

    // Verify that the changes are reflected in the table
    await expect(
      page.getByRole('cell', { name: updatedGoodName }).first(),
    ).toBeVisible();
  });

  test('Can Delete Good Test', async ({ page }) => {
    await page.waitForURL(
      'https://hues-frontend-dev.vercel.app/en/inventory/goods',
    );
    await page.waitForTimeout(1000);

    // Locate the row that contains the specific updatedGoodName
    const itemRow = page.getByRole('row', { name: updatedGoodName });

    // Click the "Open menu" button within that row
    await itemRow.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('button.text-red-500').click();
    await page.waitForTimeout(1000);
    await page.locator('button.bg-primary').click();
    await page.waitForTimeout(1000);
  });
});

test('Can Download Sample File', async ({ page }) => {
  await page.waitForURL(
    'https://hues-frontend-dev.vercel.app/en/inventory/goods',
  );
  await page.waitForTimeout(1000);

  // Click on upload button
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.waitForTimeout(1000);

  // Click on download sample file button
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByText('Sample').click(),
  ]);

  // Define a path to save the file
  const downloadPath = path.join(
    __dirname,
    'downloads',
    download.suggestedFilename(),
  );
  await download.saveAs(downloadPath);

  // Ensure the file exists in the system
  expect(fs.existsSync(downloadPath)).toBeTruthy();

  // Optional: Validate file type
  expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/);
});

test('Can Upload File', async ({ page }) => {
  await page.waitForURL(
    'https://hues-frontend-dev.vercel.app/en/inventory/goods',
  );
  await page.waitForTimeout(1000);

  // Click on upload button
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.waitForTimeout(1000);

  // Upload file
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles(
    './__tests__/e2e/item-master/downloads/goodsSample.xlsx',
  );
  await page.waitForTimeout(2000);

  await page.getByText('View').click();
  await page.waitForTimeout(2000);

  // Verify uploaded items are visible in table
  await expect(
    page.getByRole('cell', { name: 'Upload Product 123' }).first(),
  ).toBeVisible();
});

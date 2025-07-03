import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Contacts' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Vendors' }).click({ timeout: 5000 });
  await page.waitForTimeout(3000);
});

test('Vendor list is Visible', async ({ page }) => {
  // Locate the scrollable container
  const scrollableDiv = page.locator('.overflow-y-auto');

  // Locate the elements to be checked
  const vendorNameCell = page.getByRole('cell', { name: 'Aayush' });
  const phoneCell = page.getByText('+91 7073455252');
  const vendorIdCell = page.getByRole('cell', { name: 'FLVPM8156A' });

  // Scroll and verify elements
  await scrollableDiv.scrollIntoViewIfNeeded();
  await vendorNameCell.scrollIntoViewIfNeeded();
  await expect(vendorNameCell).toBeVisible();

  await phoneCell.scrollIntoViewIfNeeded();
  await expect(phoneCell).toBeVisible();

  await vendorIdCell.scrollIntoViewIfNeeded();
  await expect(vendorIdCell).toBeVisible();
});

const generateFakePAN = () =>
  `${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => c)[(Math.random() * 26) | 0]}${
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .repeat(4)
      .split('')
      .map((c) => c)[(Math.random() * 26) | 0]
  }${
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .repeat(3)
      .split('')
      .map((c) => c)[(Math.random() * 26) | 0]
  }${
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .repeat(2)
      .split('')
      .map((c) => c)[(Math.random() * 26) | 0]
  }${
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .repeat(1)
      .split('')
      .map((c) => c)[(Math.random() * 26) | 0]
  }${Math.random().toString().slice(2, 6)}${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => c)[(Math.random() * 26) | 0]}`;

const uniqueName = `Dummy Vendor ${Date.now()}`;
const fakeNumber = Math.floor(1000000000 + Math.random() * 9000000000);

test('Can Add Vendor', async ({ page }) => {
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByLabel('Identifier Number (PAN) *').click();
  await page
    .getByLabel('Identifier Number (PAN) *')
    .fill(`${generateFakePAN()}`);
  await page.getByText('Continue to add new vendor').click();
  await page.locator('#name').click();
  await page.locator('#name').fill(uniqueName);
  await page.locator('#mobileNumber').click();
  await page.locator('#mobileNumber').fill(`${fakeNumber}`);
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(
    page.getByRole('cell', { name: uniqueName, exact: true }),
  ).toBeVisible();
});

test('Can Edit Vendor', async ({ page }) => {
  await page.waitForTimeout(2000);

  // Locate vendor row
  const vendorRow = page.getByRole('row', { name: uniqueName });

  // Open edit menu
  await vendorRow.getByRole('button', { name: 'open menu' }).click();
  await page.getByText('Edit').click();

  // Wait for edit form
  await page.waitForSelector('form');

  // Modify vendor details
  const newMobileNumber = Math.floor(1000000000 + Math.random() * 9000000000);
  const newUniqueName = `Updated Dummy Vendor ${Date.now()}`;
  await page.locator('#name').click();
  await page.locator('#name').fill(newUniqueName);
  await page.locator('#mobileNumber').click();
  await page.locator('#mobileNumber').fill(`${newMobileNumber}`);

  // Save changes
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.waitForTimeout(2000);

  // Verify that the changes are reflected
  await expect(
    page.getByRole('cell', { name: newUniqueName, exact: true }),
  ).toBeVisible();
});

test('Can Download Vendor List', async ({ page }) => {
  await page.waitForLoadState('networkidle');

  // Wait for download event and click download button
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('button.border-input').click(),
  ]);

  // Verify file download
  expect(download).not.toBeNull();

  // Define save path
  const downloadPath = path.join(
    __dirname,
    'downloads',
    download.suggestedFilename(),
  );
  await download.saveAs(downloadPath);

  // Ensure file exists
  expect(fs.existsSync(downloadPath)).toBeTruthy();

  // Verify file type
  expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/);
});

test('Can Download Vendor Sample File', async ({ page }) => {
  await page.waitForTimeout(1000);

  // Click upload button
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.waitForTimeout(1000);

  // Click download sample button
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByText('Sample').click(),
  ]);

  // Verify file download
  expect(download).not.toBeNull();

  // Define save path
  const downloadPath = path.join(__dirname, 'downloads', 'vendorSample.xlsx');
  await download.saveAs(downloadPath);

  // Ensure file exists
  expect(fs.existsSync(downloadPath)).toBeTruthy();

  // Verify file type
  expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/);
});

test('Can Upload Vendor File', async ({ page }) => {
  await page.waitForTimeout(1000);

  // Click upload button
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.waitForTimeout(1000);

  // Upload file
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles(
    './__tests__/e2e/vendors/downloads/vendorSample.xlsx',
  );
  await page.waitForTimeout(2000);

  await page.getByText('View').click();
  await page.waitForTimeout(2000);

  // Verify uploaded items are visible in table
  await expect(
    page.getByRole('cell', { name: 'Upload Vendor 123' }).first(),
  ).toBeVisible();
});

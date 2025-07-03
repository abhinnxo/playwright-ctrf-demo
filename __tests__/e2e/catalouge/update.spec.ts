import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto'; // Node.js built-in module

//  use only one worker to run this test

test.describe.serial('Catalouge Update Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://hues-frontend-dev.vercel.app/en/');
    await page
      .getByRole('link', { name: 'Catalogue' })
      .click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Can Update Catalouge Test', async ({ page }) => {
    await page.getByRole('button', { name: 'Update' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Scroll until we find the rows
    let foundFirstRow = false;
    let foundSecondRow = false;

    while (!foundFirstRow || !foundSecondRow) {
      // Check if rows are visible
      const firstRow = page.getByRole('row', {
        name: 'Select row Upload Product 123',
      });
      const secondRow = page.getByRole('row', {
        name: 'Select row Test Product 40e47d92 New Manufacture 1234 1000',
      });

      if (await firstRow.isVisible()) {
        await page
          .getByRole('row', { name: 'Select row Upload Product 123' })
          .getByLabel('Select row')
          .click();
        foundFirstRow = true;
      }

      if (await secondRow.isVisible()) {
        await page
          .getByRole('row', {
            name: 'Select row Test Product 40e47d92 New Manufacture 1234 1000',
          })
          .getByLabel('Select row')
          .click();
        foundSecondRow = true;
      }

      if (!foundFirstRow || !foundSecondRow) {
        await page.evaluate(() => window.scrollBy(0, 100));
        await page.waitForTimeout(500); // Wait for scroll to complete
      }
    }

    await page.getByRole('button', { name: 'Add to Catalogue' }).click();
    await page.waitForURL('https://hues-frontend-dev.vercel.app/en/catalogue');
    await expect(
      page.getByRole('cell', { name: 'Upload Product' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Test Product 40e47d92' }),
    ).toBeVisible();
  });

  const goodName = `TEST PRODUCT ${randomUUID().substring(0, 8)}`;
  // console.log(goodName);

  test('Can Add New Item Test', async ({ page }) => {
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByRole('button', { name: 'Add a new item' }).click();
    await page.getByLabel('Product Name *').click();
    await page.getByLabel('Product Name *').fill(goodName);
    await page.getByLabel("Manufacturer's Name *").click();
    await page.getByLabel("Manufacturer's Name *").fill('TEST MANUFACTURE');
    await page.getByLabel('Description *').click();
    await page.getByLabel('Description *').fill('LOREM IPSUM');
    await page.getByLabel('HSN Code *').click();
    await page.getByLabel('HSN Code *').fill('1234');
    await page.getByLabel('Rate *').click();
    await page.getByLabel('Rate *').fill('999');
    await page.getByLabel('GST (%) *').click();
    await page.getByLabel('GST (%) *').fill('5');
    await page.getByLabel('Quantity *').click();
    await page.getByLabel('Quantity *').fill('20');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('cell', { name: goodName })).toBeVisible();
  });

  test('Can Delete Multiple Catalouge Items Test', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page
      .getByRole('row', { name: 'Select row Upload Product 123' })
      .getByLabel('Select row')
      .click();
    await page
      .getByRole('row', { name: 'Select row Test Product' })
      .getByLabel('Select row')
      .click();
    await page
      .getByRole('row', { name: 'Select row TEST PRODUCT Goods' })
      .getByLabel('Select row')
      .click();
    await page
      .locator('div')
      .filter({ hasText: /^Update$/ })
      .getByRole('button')
      .nth(4)
      .click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(
      page.getByRole('cell', { name: 'Upload Product' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Test Product 40e47d92' }),
    ).not.toBeVisible();
    await expect(page.getByRole('cell', { name: goodName })).not.toBeVisible();
  });
});

import { test, expect, Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://hues-frontend-dev.vercel.app/en/');
  await page.getByRole('link', { name: 'Contacts' }).click();
  await page.getByRole('link', { name: 'Vendors' }).click();
  await page.waitForTimeout(2000);
});

test('Cannot add yourself as vendor', async ({ page }) => {
  await page.getByRole('button', { name: 'Add' }).click();
  await page
    .getByRole('textbox', { name: 'Identifier Number (PAN) *' })
    .click();
  await page
    .getByRole('textbox', { name: 'Identifier Number (PAN) *' })
    .fill('IYBPK0035G');
  await page.getByText('Continue to add new vendor').click();
  await page.locator('#name').click();
  await page.locator('#name').fill('Abhinn');
  await page.locator('#mobileNumber').click();
  await page.locator('#mobileNumber').fill('6388541550');
  await page.getByRole('spinbutton', { name: 'Pincode *' }).click();
  await page.getByRole('spinbutton', { name: 'Pincode *' }).fill('226010');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('.fixed').first()).toBeVisible();
  await expect(page.getByText('Cannot add self as vendor')).toBeVisible();
});

test('Cannot add already added vendor which has already accepted the invite', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Add' }).click();
  await page
    .getByRole('textbox', { name: 'Identifier Number (PAN) *' })
    .click();
  await page
    .getByRole('textbox', { name: 'Identifier Number (PAN) *' })
    .fill('AAAAA9999A');
  await expect(page.getByText('Continue to add new vendor')).not.toBeVisible();
});

test('Can send reminder to pending vendor', async ({ page }) => {
  await page
    .getByRole('row', { name: 'Abhinn Krishn +91 0638854155' })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Send Reminder' }).click();
  await expect(page.getByText('Invitation Reminded')).toBeVisible();
});

test('Cannot add already added vendor which has pending status', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Add' }).click();
  await page
    .getByRole('textbox', { name: 'Identifier Number (PAN) *' })
    .click();
  await page
    .getByRole('textbox', { name: 'Identifier Number (PAN) *' })
    .fill('AAAAA9999Q');
  await page.getByText('Continue to add new vendor').click();
  await page.locator('#name').click();
  await page.locator('#name').fill('Abhinn');
  await page.locator('#mobileNumber').click();
  await page.locator('#mobileNumber').fill('1234567890');
  await page.getByRole('spinbutton', { name: 'Pincode *' }).click();
  await page.getByRole('spinbutton', { name: 'Pincode *' }).fill('226010');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(
    page.getByText(
      'This vendor with this PAN has already been added to this enterprise',
    ),
  ).toBeVisible();
});

// FIXME: this test is flaky and not working as intendent, and its passing which is wrong
test.skip('Can scroll the div with scrollBarStyles class', async ({ page }) => {
  // Wait for the div to be present
  const scrollDiv = page.locator('.overflow-y-scroll');
  await scrollDiv.waitFor();

  // Scroll to the bottom of the div
  await scrollDiv.evaluate((element) => {
    element.scrollTo(0, element.scrollHeight);
  });
});

import { test, expect } from "@playwright/test";

test.describe("Playwright Website Tests", () => {
  test("has title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Playwright/);
  });

  test("get started link", async ({ page }) => {
    await page.goto("/");

    // Look for Get started link with timeout
    const getStartedLink = page.getByRole("link", { name: /get started/i });
    await expect(getStartedLink).toBeVisible({ timeout: 10000 });
    await getStartedLink.click();

    // Wait for navigation and check for installation content
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: /installation/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("navigation menu", async ({ page }) => {
    await page.goto("/");

    // Check main navigation - use more flexible selectors
    await expect(page.locator("nav")).toBeVisible();

    // Look for common navigation patterns
    const docsLink = page.getByRole("link", { name: /docs/i }).first();
    await expect(docsLink).toBeVisible({ timeout: 5000 });
  });

  test("page content loads", async ({ page }) => {
    await page.goto("/");

    // Wait for main content to load
    await page.waitForLoadState("networkidle");

    // Check for main heading or content
    const mainContent = page.locator('main, [role="main"], h1').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test("footer exists", async ({ page }) => {
    await page.goto("/");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Check for footer
    const footer = page.locator('footer, [role="contentinfo"]').first();
    await expect(footer).toBeVisible({ timeout: 5000 });
  });

  // Simple intentional failure test
  test("intentional failure demo", async ({ page }) => {
    await page.goto("/");

    // This will fail to demonstrate failure reporting
    await expect(page).toHaveTitle("Non-existent Title That Will Fail");
  });
});

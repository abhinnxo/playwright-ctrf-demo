import { test, expect } from "@playwright/test";

test.describe("Playwright Website Tests", () => {
  test("has title", async ({ page }) => {
    await page.goto("/");

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
  });

  test("get started link", async ({ page }) => {
    await page.goto("/");

    // Click the get started link.
    await page.getByRole("link", { name: "Get started" }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(
      page.getByRole("heading", { name: "Installation" })
    ).toBeVisible();
  });

  test("check documentation link", async ({ page }) => {
    await page.goto("/");

    // Find and click documentation link
    await page.getByRole("link", { name: "Docs" }).click();

    // Verify we're on the docs page
    await expect(
      page.getByRole("heading", {
        name: "Playwright enables reliable end-to-end testing for modern web apps.",
      })
    ).toBeVisible();
  });

  test("search functionality", async ({ page }) => {
    await page.goto("/");

    // Click search button
    await page.getByRole("button", { name: "Search" }).click();

    // Type in search box
    await page.getByPlaceholder("Search docs").fill("testing");

    // Verify search suggestions appear
    await expect(page.getByRole("option")).toHaveCount(1, { timeout: 5000 });
  });

  test("navigation menu", async ({ page }) => {
    await page.goto("/");

    // Check if main navigation items are present
    await expect(page.getByRole("link", { name: "Docs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "API" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Community" })).toBeVisible();
  });

  test("footer links", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer links
    await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Discord" })).toBeVisible();
  });

  // This test will intentionally fail to demonstrate failure reporting
  test("intentional failure demo", async ({ page }) => {
    await page.goto("/");

    // This assertion will fail to show how failures are reported
    await expect(page).toHaveTitle("This Title Does Not Exist");
  });

  test("responsive design check", async ({ page }) => {
    await page.goto("/");

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile menu button is visible
    const mobileMenuButton = page.locator('[aria-label="Toggle navigation"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.getByRole("link", { name: "Docs" })).toBeVisible();
    }
  });
});

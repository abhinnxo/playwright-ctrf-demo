import { test as base, expect } from "@playwright/test";

const test = base.extend({
  // Override any global setup for auth if it exists
  storageState: undefined,
});

test.beforeEach(async ({ page }) => {
  await page.goto("https://hues-frontend-dev.vercel.app/en/login");
});

test("Can Sign In with right Creds", async ({ page }) => {
  await page.waitForTimeout(2000);
  await page.getByPlaceholder("Enter a Aadhar linked phone").fill("9532751771");
  await page.getByRole("button", { name: "Send OTP" }).click();

  await page.waitForSelector("text=Verify your number", { state: "visible" });

  await page.getByRole("textbox").fill("8080");
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true })
  ).toBeVisible({ timeout: 5000 });
});

test("Cannot Sign In with Wrong OTP", async ({ page }) => {
  await page.waitForTimeout(2000);
  await page.getByPlaceholder("Enter a Aadhar linked phone").fill("9532751771");
  await page.getByRole("button", { name: "Send OTP" }).click();
  await page.waitForSelector("text=Verify your number", { state: "visible" });
  await page.getByRole("textbox").fill("1111");
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByText("Invalid OTP")).toBeVisible({
    timeout: 5000,
  });
  // comment
});

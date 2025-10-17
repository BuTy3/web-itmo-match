const { test, expect } = require("@playwright/test");

test("G3.6: e2e must fail to block merge", async ({ page }) => {
  await page.goto("about:blank");
  await expect(page).toHaveTitle("My App");
});

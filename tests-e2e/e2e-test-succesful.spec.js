const { test, expect } = require("@playwright/test");

// Корректное ожидание — у about:blank заголовок пустой.
// Тест пройдёт, job будет зелёным.
test("G3.6: e2e must pass when expectations are met", async ({ page }) => {
  await page.goto("about:blank");
  await expect(page).toHaveTitle("");
});

import { test, expect } from '@playwright/test';

test.describe('Auth pages', () => {
  test('login succeeds and redirects to home', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, token: 'e2e-token-login' }),
      });
    });

    await page.goto('/login');

    await page.getByLabel('Никнейм').fill('user1');
    await page.getByLabel('Пароль').fill('pass1');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page).toHaveURL(/\/$/);

    const storedToken = await page.evaluate(() =>
      localStorage.getItem('accessToken'),
    );
    expect(storedToken).toBe('e2e-token-login');
  });

  test('register succeeds and redirects to home', async ({ page }) => {
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, token: 'e2e-token-register' }),
      });
    });

    await page.goto('/register');

    await page.getByLabel('Никнейм').fill('user2');
    await page.getByLabel('Пароль').fill('pass2');
    await page.getByLabel('Повторите пароль').fill('pass2');
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    await expect(page).toHaveURL(/\/$/);

    const storedToken = await page.evaluate(() =>
      localStorage.getItem('accessToken'),
    );
    expect(storedToken).toBe('e2e-token-register');
  });
});

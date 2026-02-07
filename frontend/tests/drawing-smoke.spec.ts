import { test, expect } from '@playwright/test';

test.describe('Drawing (frontend) e2e', () => {
  test('topic loads and can be refreshed; toolbar toggles', async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.route('**/auth/login', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      return route.fulfill({ json: { ok: true, token: 'token-1' } });
    });

    await page.route('**/drawing/topic**', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      const url = new URL(route.request().url());
      const lastTopic = url.searchParams.get('last_topic');
      const topic = lastTopic === 'Topic 1' ? 'Topic 2' : 'Topic 1';
      return route.fulfill({ json: { ok: true, topic } });
    });

    await page.goto(`${baseURL}/login`);
    await page.getByLabel('Никнейм').fill('user1');
    await page.getByLabel('Пароль').fill('pass');
    await page.getByRole('button', { name: 'Войти' }).click();

    const drawer = page.locator('.MuiDrawer-root');
    await drawer.getByRole('button', { name: 'Рисование' }).click();

    await expect(page.locator('.drawing-title')).toContainText('Тут можно создавать шедевры');
    await expect(page.locator('.drawing-canvas')).toBeVisible();

    await expect(page.locator('.topic-card__text')).toHaveText('Topic 1');
    await page.locator('.topic-card__action').click();
    await expect(page.locator('.topic-card__text')).toHaveText('Topic 2');

    await page.getByRole('button', { name: 'Ластик' }).click();
    await expect(page.getByRole('button', { name: 'Ластик' })).toHaveClass(/toolbar__icon-button--active/);

    await expect(page.getByRole('button', { name: 'Цвет #1C1C1E' })).toHaveClass(/toolbar__color-button--active/);
    await page.getByRole('button', { name: 'Цвет #FFFFFF' }).click();
    await expect(page.getByRole('button', { name: 'Цвет #FFFFFF' })).toHaveClass(/toolbar__color-button--active/);
  });
});

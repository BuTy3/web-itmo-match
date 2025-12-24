import { test, expect } from '@playwright/test';

test.describe('History (frontend) e2e', () => {
  test('history list filters and room details', async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

    await page.route('**/auth/login', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      return route.fulfill({ json: { ok: true, token: 'token-1' } });
    });

    await page.route('**/history/1', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      return route.fulfill({
        json: {
          ok: true,
          room: {
            id: '1',
            name: 'Room A',
            topic: 'Topic',
            match_mode: 'WATCH_ALL',
            status: 'CLOSED',
            access_mode: 'PUBLIC',
            created_at: new Date().toISOString(),
            closed_at: new Date().toISOString(),
            date: '18.12.2025',
            result: {
              name: 'Card A',
              description: 'Desc A',
              image_url: null,
            },
            creator: { id: '1', display_name: 'Creator', avatar_url: null },
            participants: [
              {
                user_id: '1',
                display_name: 'name1',
                avatar_url: null,
                joined_at: new Date().toISOString(),
                finished_at: new Date().toISOString(),
              },
              {
                user_id: '2',
                display_name: 'name2',
                avatar_url: null,
                joined_at: new Date().toISOString(),
                finished_at: new Date().toISOString(),
              },
            ],
          },
        },
      });
    });

    await page.route('**/history', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      const body = (await route.request().postDataJSON()) as any;
      const date = body?.filters?.date ?? '';

      const rooms =
        date === '18.12.2025'
          ? [
              {
                id: '1',
                name: 'Room A',
                url_image: null,
                type: 'Type A',
                description: '',
                date: '18.12.2025',
              },
            ]
          : [];

      return route.fulfill({ json: { ok: true, rooms } });
    });

    await page.goto(`${baseURL}/login`);
    await page.getByLabel('Никнейм').fill('user1');
    await page.getByLabel('Пароль').fill('pass');
    await page.getByRole('button', { name: 'Войти' }).click();

    // Navigate inside SPA (token is not persisted).
    const drawer = page.locator('.MuiDrawer-root');
    await drawer.getByRole('button', { name: 'История' }).click();

    await expect(page.getByRole('heading', { name: 'История' })).toBeVisible();

    // Filter: show room only for matching date.
    await page.getByLabel('Фильтр по дате').fill('18.12.2025');
    await expect(page.locator('.history-card')).toHaveCount(1);

    await page.getByLabel('Фильтр по дате').fill('01.01.2025');
    await expect(page.locator('.history-card')).toHaveCount(0);

    await page.getByLabel('Фильтр по дате').fill('18.12.2025');
    await page.getByRole('link', { name: 'Открыть Room A' }).click();

    await expect(page).toHaveURL(/\/history\/1$/);
    await expect(page.locator('.history-room-subtitle__name')).toHaveText('Room A');
    await expect(page.locator('.history-room-participants__list')).toContainText('name1');
    await expect(page.locator('.history-room-participants__list')).toContainText('name2');
    await expect(page.locator('.history-room-card__title')).toHaveText('Card A');

    await page.getByRole('button', { name: 'Назад' }).click();
    await expect(page).toHaveURL(/\/histore$/);
    await expect(page.getByRole('heading', { name: 'История' })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

const setAuthStorage = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'e2e-token');
    localStorage.setItem('nickname', 'e2e-user');
  });
};

test.describe('Home', () => {
  test('home shows ready collections and searches room', async ({ page }) => {
    await setAuthStorage(page);

    await page.route('**/home', async (route) => {
      if (route.request().method() !== 'GET') {
        return route.fallback();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          collections: [
            {
              id: 1,
              url_image: null,
              type: 'UI',
              description: 'Ready collection',
              items: [],
            },
            {
              id: 2,
              url_image: null,
              type: 'Moodboard',
              description: 'Second collection',
              items: [{ item_id: 1, url_image: null, description: 'Item' }],
            },
          ],
        }),
      });
    });

    await page.route('**/home/search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, id_room: 12 }),
      });
    });

    await page.goto('/home');

    await expect(page.getByText('Ready collection')).toBeVisible();
    await expect(page.getByText('Second collection')).toBeVisible();

    await page.getByLabel('Фильтр по типу').selectOption('UI');

    await expect(page.getByText('Ready collection')).toBeVisible();
    await expect(page.getByText('Second collection')).toHaveCount(0);

    await page.getByPlaceholder('Введите id').fill('12');
    await page.getByRole('button', { name: 'Найти комнату' }).click();

    await expect(page).toHaveURL(/\/rooms\/connect\/12$/);
  });
});

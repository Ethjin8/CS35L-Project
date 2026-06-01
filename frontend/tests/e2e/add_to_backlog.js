import { test, expect } from '@playwright/test';

function randUser() { return `e2e_user_${Math.floor(Math.random() * 100000)}`; }

test('E2E: add item to backlog via UI', async ({ page, request }) => {
  const username = randUser();
  const password = 'password123';

  const createRes = await request.post('http://127.0.0.1:3000/users', { data: { username, password } });
  expect(createRes.ok(), `User creation failed: ${await createRes.text()}`).toBeTruthy();
  const loginRes = await request.post('http://127.0.0.1:3000/login', { data: { username, password } });
  expect(loginRes.ok(), `Login failed: ${await loginRes.text()}`).toBeTruthy();
  const tokens = await loginRes.json();

  // inject tokens so app authenticates
  await page.addInitScript(({ a, r }) => {
    localStorage.setItem('accessToken', a);
    localStorage.setItem('refreshToken', r);
  }, { a: tokens.accessToken, r: tokens.refreshToken });

  await page.goto('/search');

  // reveal action button and click add to backlog
  const firstCard = page.locator('.group').first();
  await expect(firstCard).toBeVisible({ timeout: 20000 });
  await firstCard.hover();
  await firstCard.getByRole('button', { name: '+ Backlog' }).click();

  // confirm added to backlog
  const backlogRes = await request.get('http://127.0.0.1:3000/backlog/sorted', {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  expect(backlogRes.ok()).toBeTruthy();
  const rows = await backlogRes.json();
  expect(rows.length).toBeGreaterThan(0);
});

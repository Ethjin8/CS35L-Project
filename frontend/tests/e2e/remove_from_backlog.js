import { test, expect } from '@playwright/test';

function randUser() { return `e2e_user_${Math.floor(Math.random() * 100000)}`; }

// hover the card matching the title, then click an action button
async function clickActionForTitle(page, title, actionText) {
  const card = page.locator('.group').filter({ has: page.locator(`img[alt="${title}"]`) });
  await expect(card).toBeVisible({ timeout: 20000 });
  await card.hover();
  await card.getByRole('button', { name: actionText }).click();
}

test('E2E: remove item from backlog via UI', async ({ page, request }) => {
  const username = randUser();
  const password = 'password123';

  const createRes = await request.post('http://127.0.0.1:3000/users', { data: { username, password } });
  expect(createRes.ok(), `User creation failed: ${await createRes.text()}`).toBeTruthy();
  const loginRes = await request.post('http://127.0.0.1:3000/login', { data: { username, password } });
  expect(loginRes.ok(), `Login failed: ${await loginRes.text()}`).toBeTruthy();
  const tokens = await loginRes.json();

  // inject tokens; confirm() returns true so handleRemove doesn't bail early
  await page.addInitScript(({ a, r }) => {
    localStorage.setItem('accessToken', a);
    localStorage.setItem('refreshToken', r);
    window.confirm = () => true;
  }, { a: tokens.accessToken, r: tokens.refreshToken });

  // add a movie via search UI
  await page.goto('/search');
  const firstCard = page.locator('.group').first();
  await expect(firstCard).toBeVisible({ timeout: 20000 });
  await firstCard.hover();
  await firstCard.getByRole('button', { name: '+ Backlog' }).click();

  // get real title from backend so we don't hardcode a string that could drift
  const fullRes = await request.get('http://127.0.0.1:3000/backlog/full', {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  expect(fullRes.ok()).toBeTruthy();
  const fullRows = await fullRes.json();
  expect(fullRows.length).toBeGreaterThan(0);
  const movie = fullRows[0];
  const expectedTitle = movie.title;

  // listen before clicking to avoid a race with the response
  await page.goto('/home');
  const waitForDelete = page.waitForResponse(
    (r) => r.url().includes('/api/movies/') && r.request().method() === 'DELETE',
    { timeout: 10000 },
  );
  await clickActionForTitle(page, expectedTitle, 'Remove');
  await waitForDelete;

  // confirm DB removed the entry
  const afterRes = await request.get('http://127.0.0.1:3000/backlog/sorted', {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  const afterRows = await afterRes.json();
  const still = afterRows.find((r) => r.movie_show_id === movie.id);
  expect(still, 'item should have been removed but is still in backlog').toBeUndefined();
});

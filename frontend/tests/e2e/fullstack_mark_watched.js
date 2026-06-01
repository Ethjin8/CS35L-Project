import { test, expect } from '@playwright/test';

function randUser() { return `e2e_user_${Math.floor(Math.random() * 100000)}`; }

test('full-stack: marking recommended as watched removes the hero', async ({ page, request }) => {
  const username = randUser();
  const password = 'password123';

  const createRes = await request.post('http://127.0.0.1:3000/users', { data: { username, password } });
  expect(createRes.ok(), `User creation failed: ${await createRes.text()}`).toBeTruthy();
  const loginRes = await request.post('http://127.0.0.1:3000/login', { data: { username, password } });
  expect(loginRes.ok(), `Login failed: ${await loginRes.text()}`).toBeTruthy();
  const tokens = await loginRes.json();

  // The Matrix — stable TMDB ID, makes a real API call
  const movieId = 603;
  const addRes = await request.post(`http://127.0.0.1:3000/movies/${movieId}`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  expect(addRes.ok()).toBeTruthy();

  // inject tokens; confirm() returns true so handleWatched doesn't bail early
  await page.addInitScript(({ a, r }) => {
    localStorage.setItem('accessToken', a);
    localStorage.setItem('refreshToken', r);
    window.confirm = () => true;
  }, { a: tokens.accessToken, r: tokens.refreshToken });

  await page.goto('/home');

  const hero = page.locator('.recommended-hero');
  await expect(hero).toBeVisible();

  // listen before clicking to avoid a race with the response
  const waitForPatch = page.waitForResponse(
    (r) => r.url().includes('/api/backlog/status/') && r.request().method() === 'PATCH',
    { timeout: 10000 },
  );
  await hero.getByRole('button', { name: 'Mark as Watched' }).click();
  await waitForPatch;

  // .recommended-hero always exists; only the filled variant has .hero-buttons
  await expect(page.locator('.hero-buttons')).toHaveCount(0);
});

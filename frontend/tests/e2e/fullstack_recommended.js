import { test, expect } from '@playwright/test';

function randUser() { return `e2e_user_${Math.floor(Math.random() * 100000)}`; }

test('full-stack: backlog recommendation appears in home', async ({ page, request }) => {
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

  // get real title from backend so we don't hardcode a string that could drift
  const fullRes = await request.get('http://127.0.0.1:3000/backlog/full', {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  expect(fullRes.ok()).toBeTruthy();
  const fullRows = await fullRes.json();
  const expectedTitle = fullRows[0].title;

  // inject tokens so the app boots as authenticated
  await page.addInitScript(({ a, r }) => {
    localStorage.setItem('accessToken', a);
    localStorage.setItem('refreshToken', r);
  }, { a: tokens.accessToken, r: tokens.refreshToken });

  await page.goto('/home');

  // confirm hero shows the added movie
  const hero = page.locator('.recommended-hero');
  await expect(hero).toBeVisible();
  await expect(hero.locator('h1')).toHaveText(expectedTitle);
});

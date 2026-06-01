const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.js',  // only picks up *.js
  timeout: 30_000,
  workers: 1,   // 1 simulated user to avoid data race
  retries: 1,   // 1 retry for each test: addresses potential issues with server
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',  // real port, port 5173 is the backup
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
});

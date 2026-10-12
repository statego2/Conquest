import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: 'live.spec.mjs',
  fullyParallel: false,
  retries: 1,
  reporter: [['line']],
  use: {
    baseURL: 'https://statego2.github.io/Conquest/',
    browserName: 'chromium',
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    navigationTimeout: 30000,
  }
});

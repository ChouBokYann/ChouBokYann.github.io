import { defineConfig, devices } from '@playwright/test';

const configuredBase = process.env.BASE_PATH?.trim();
const basePath =
  configuredBase && configuredBase !== '/'
    ? `/${configuredBase}`.replace(/\/{2,}/g, '/').replace(/\/$/, '')
    : '';
const serverUrl = `http://127.0.0.1:4321${basePath}/`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  globalSetup: './tests/support/playwright-global-setup.ts',
  use: {
    baseURL: serverUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /project-pages\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      testIgnore: /project-pages\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'fixture-chromium',
      dependencies: ['chromium', 'mobile-chromium'],
      testMatch: /project-pages\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:4322${basePath}/`,
      },
    },
    {
      name: 'fixture-mobile-chromium',
      dependencies: ['fixture-chromium'],
      testMatch: /project-pages\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        baseURL: `http://127.0.0.1:4323${basePath}/`,
      },
    },
  ],
});

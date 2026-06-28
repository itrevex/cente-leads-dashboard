import { defineConfig, devices } from '@playwright/test';

const coverageEnabled = process.env.COVERAGE === 'true';

function serverCommand(name: string, port: number) {
  return `node ./e2e/bootstrap/server.mjs --handlers=${name} --port=${port}`;
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html']],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: serverCommand('auth', 3100),
      port: 3100,
      reuseExistingServer: !process.env.CI && !coverageEnabled,
      env: { ...process.env, COVERAGE: coverageEnabled ? 'true' : '' },
    },
    {
      command: serverCommand('auth-invalid-otp', 3101),
      port: 3101,
      reuseExistingServer: !process.env.CI && !coverageEnabled,
      env: { ...process.env, COVERAGE: coverageEnabled ? 'true' : '' },
    },
    {
      command: serverCommand('auth-refresh-expired', 3102),
      port: 3102,
      reuseExistingServer: !process.env.CI && !coverageEnabled,
      env: { ...process.env, COVERAGE: coverageEnabled ? 'true' : '' },
    },
    {
      command: serverCommand('auth-direct', 3105),
      port: 3105,
      reuseExistingServer: !process.env.CI && !coverageEnabled,
      env: { ...process.env, COVERAGE: coverageEnabled ? 'true' : '' },
    },
    {
      command: serverCommand('overview', 3103),
      port: 3103,
      reuseExistingServer: !process.env.CI && !coverageEnabled,
      env: { ...process.env, COVERAGE: coverageEnabled ? 'true' : '' },
    },
    {
      command: serverCommand('products', 3104),
      port: 3104,
      reuseExistingServer: !process.env.CI && !coverageEnabled,
      env: { ...process.env, COVERAGE: coverageEnabled ? 'true' : '' },
    },
  ],
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3103',
      },
    },
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3101',
      },
    },
    {
      name: 'auth-refresh-expired',
      testMatch: /auth-refresh\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3102',
      },
    },
    {
      name: 'auth-direct',
      testMatch: /auth-direct\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3105',
      },
    },
    {
      name: 'overview',
      testMatch: /overview\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3103',
        storageState: 'playwright/.auth/system-admin.json',
      },
    },
    {
      name: 'products',
      testMatch: /products.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3104',
        storageState: 'playwright/.auth/system-admin.json',
      },
    },
  ],
});

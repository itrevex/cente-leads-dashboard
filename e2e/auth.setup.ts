import fs from 'node:fs/promises';
import path from 'node:path';

import { test, expect } from './fixtures/test';

test('stores authenticated system-admin session', async ({ page, context }) => {
  await page.goto('/login');

  await page.getByLabel('Phone').fill('+256700000001');
  await page.getByLabel('Password').fill('Passw0rd!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeVisible();

  await page.getByLabel('6-digit code').fill('123456');
  await page.getByRole('button', { name: 'Verify' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: /Good morning, System/i })).toBeVisible();

  const authDir = path.resolve(process.cwd(), 'playwright/.auth');
  await fs.mkdir(authDir, { recursive: true });
  await context.storageState({ path: path.join(authDir, 'system-admin.json') });
});

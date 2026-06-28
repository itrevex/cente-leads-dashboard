import { test, expect } from './fixtures/test';

test('supports direct login completion without OTP', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Phone').fill('+256700000001');
  await page.getByLabel('Password').fill('Passw0rd!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: /Good morning, System/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Enter verification code' })).toHaveCount(0);
});

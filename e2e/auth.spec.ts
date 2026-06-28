import { test, expect } from './fixtures/test';

test('shows an error for invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Phone').fill('+256700000001');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Invalid phone or password.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('shows an error when the OTP is invalid', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Phone').fill('+256700000001');
  await page.getByLabel('Password').fill('Passw0rd!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByLabel('6-digit code').fill('000000');
  await page.getByRole('button', { name: 'Verify' }).click();

  await expect(page.getByText('Invalid or expired code.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

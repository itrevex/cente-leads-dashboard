import { test, expect } from './fixtures/test';

test('renders overview KPIs and recent activity for an authenticated user', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Good morning, System/i })).toBeVisible();
  await expect(page.getByText('Total in Pipeline')).toBeVisible();
  await expect(page.locator('div.text-3xl.font-bold.text-white').first()).toHaveText('48');
  await expect(page.getByRole('link', { name: /Export/i })).toHaveAttribute(
    'href',
    '/api/reports/overview/export',
  );
  await page.locator('button[title="Switch to dark mode"]').click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.locator('button[title="Switch to light mode"]').click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(page.getByText('Sarah Achieng')).toBeVisible();
  await expect(page.getByText('Kawempe SACCO')).toBeVisible();
});

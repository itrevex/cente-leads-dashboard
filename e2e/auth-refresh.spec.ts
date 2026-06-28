import { test, expect } from './fixtures/test';

const expiredStorageState = {
  cookies: [
    {
      name: 'cente_session',
      value: JSON.stringify({
        access:
          'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLXN5c3RlbS1hZG1pbiIsInJvbGUiOiJzeXN0ZW1fYWRtaW4iLCJleHAiOjE3MTk0NzA4MDB9.',
        refresh: 'refresh-expired',
      }),
      domain: '127.0.0.1',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 60 * 5,
      httpOnly: true,
      secure: false,
      sameSite: 'Strict' as const,
    },
  ],
  origins: [],
};

test.use({ storageState: expiredStorageState });

test('redirects to login when refresh fails for an expired session', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in to Cente Leads' })).toBeVisible();
});

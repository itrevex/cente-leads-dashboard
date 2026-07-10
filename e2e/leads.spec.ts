import { test, expect } from './fixtures/test';

test('My Leads defaults to branch scope, then tiered recommend/decline (ADR-0034)', async ({
  page,
}) => {
  // Loan Officer: "My Leads" shows the workable branch lead by default (not
  // just leads already assigned via reviewing_officer), and the Bank Review
  // Decision panel offers Recommend Decline instead of Decline.
  await page.goto('/login');
  await page.getByLabel('Phone').fill('+256700000002');
  await page.getByLabel('Password').fill('Passw0rd!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/$/);
  await page.goto('/leads/mine');
  await expect(page.getByRole('heading', { name: 'My Leads' })).toBeVisible();
  await expect(page.getByText('Andrew Kwesiga')).toBeVisible();

  await page.getByText('Andrew Kwesiga').click();
  await expect(page.getByRole('heading', { name: 'Bank Review Decision' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Recommend Decline' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Decline', exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Recommend Decline' }).click();
  await page.getByLabel(/Reason for recommending decline/i).fill('Inconsistent income docs.');
  await page.getByRole('button', { name: /Confirm Recommend Decline/i }).click();
  await expect(page.getByText('Decline Recommended')).toBeVisible();

  // Loan Officer's action set is now Recommend-only (the lead is no longer
  // in `review`, and they don't hold decline_leads to finalize it).
  await expect(page.getByRole('button', { name: 'Recommend', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Recommend Decline/i })).toHaveCount(0);

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  // Branch Manager: sees Recommend + Decline (final) on the same
  // now-decline_recommended lead, and can finalize the decline directly.
  await page.getByLabel('Phone').fill('+256700000003');
  await page.getByLabel('Password').fill('Passw0rd!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/$/);
  await page.goto('/leads/mine');
  await page.getByText('Andrew Kwesiga').click();
  await expect(page.getByText('Decline Recommended')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Recommend', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Decline', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Decline', exact: true }).click();
  await page.getByLabel(/Reason for declining/i).fill('Confirmed inconsistent documents.');
  await page.getByRole('button', { name: /Confirm Decline/i }).click();
  await expect(page.getByText('Declined', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('Request Info and Reassign (system admin, reassign_leads)', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Phone').fill('+256700000001');
  await page.getByLabel('Password').fill('Passw0rd!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/$/);
  await page.goto('/leads/lead-002');
  await expect(page.getByText('Rebecca Auma')).toBeVisible();

  await page.getByRole('button', { name: 'Request Info' }).click();
  await page
    .getByLabel(/What information is needed from the agent\?/i)
    .fill('Please attach the missing payslip.');
  await page.getByRole('button', { name: /Confirm Request Info/i }).click();
  await expect(page.getByText('Info Requested')).toBeVisible();

  await page.getByRole('button', { name: 'Reassign' }).click();
  await page.getByLabel('Reviewing officer').selectOption({ label: 'Demo Loan Officer' });
  await page.getByRole('button', { name: /Confirm Reassign/i }).click();
  await expect(page.getByText('Demo Loan Officer')).toBeVisible();

  await page.goto('/leads/lead-003');
  await expect(page.getByText('Grace Atim')).toBeVisible();
  await page.getByRole('button', { name: 'Return to Agent' }).click();
  await page.getByPlaceholder('Type a reason and press Enter').fill('Missing employer letter');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: /Confirm Return to Agent/i }).click();
  await expect(page.getByText('Returned to Agent')).toBeVisible();
});

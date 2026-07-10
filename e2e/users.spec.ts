import { test, expect } from './fixtures/test';

test('Last activity column, role filter, suspend, and role permission toggle', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Phone').fill('+256700000001');
  await page.getByLabel('Password').fill('Passw0rd!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/$/);
  await page.goto('/users');

  const loanOfficerRow = page.getByRole('row', { name: /Demo Loan Officer/i });
  await expect(loanOfficerRow).toBeVisible();
  await expect(loanOfficerRow.getByText(/minutes? ago/i)).toBeVisible();

  // branch_manager's last_active_at is null in the fixture -- confirms the
  // column isn't just always showing a relative time regardless of value.
  const branchManagerRow = page.getByRole('row', { name: /Demo Branch Manager/i });
  await expect(branchManagerRow).toBeVisible();
  await expect(branchManagerRow.getByText('Never')).toBeVisible();

  // Filter to Loan Officer only -- 12 users (the real fixture + 11
  // fillers), enough to exercise pagination (PAGE_SIZE=10).
  await page.getByRole('combobox').first().selectOption('loan_officer');
  await expect(page.getByRole('row', { name: /Demo Loan Officer/i })).toBeVisible();
  await expect(page.getByRole('row', { name: /Demo Branch Manager/i })).toHaveCount(0);
  await expect(page.getByText('Page 1 of 2')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Page 2 of 2')).toBeVisible();
  await page.getByRole('button', { name: 'Prev' }).click();
  await expect(page.getByText('Page 1 of 2')).toBeVisible();
  await page.getByRole('combobox').first().selectOption('');

  // Suspend Loan Officer, confirm the badge flips to Disabled, then
  // reactivate.
  const loanOfficerActions = page.getByRole('row', { name: /Demo Loan Officer/i });
  await loanOfficerActions.getByRole('button', { name: 'Suspend' }).click();
  await expect(loanOfficerActions.getByText('Disabled')).toBeVisible();
  await loanOfficerActions.getByRole('button', { name: 'Reactivate' }).click();
  await expect(loanOfficerActions.getByText('Active')).toBeVisible();

  // Create a new user.
  await page.getByRole('button', { name: 'New User' }).click();
  const createForm = page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: 'Create' }) });
  await createForm.locator('input').nth(0).fill('Test New User'); // Full name
  await createForm.locator('input[type="email"]').fill('new.user@cente.test');
  await createForm.locator('input').nth(2).fill('+256700000099'); // Phone
  await createForm.locator('select').first().selectOption('loan_officer');
  await createForm.getByRole('button', { name: 'Create' }).click();
  // New users are appended, so with 14 existing + 1 new the created row
  // lands on page 2 (PAGE_SIZE=10) of the unfiltered list.
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('row', { name: /Test New User/i })).toBeVisible();

  // Edit that same user.
  await page
    .getByRole('row', { name: /Test New User/i })
    .getByRole('button', { name: 'Edit' })
    .click();
  const editForm = page.locator('form').filter({ has: page.getByRole('button', { name: 'Save' }) });
  await editForm.locator('input').nth(0).fill('Test Edited User');
  await editForm.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('row', { name: /Test Edited User/i })).toBeVisible();

  // Roles & Permissions: Loan Officer starts without decline_leads; grant
  // it and save.
  await page.getByRole('button', { name: 'Roles & Permissions' }).click();
  await page.getByRole('button', { name: /Loan Officer/i }).click();
  const declineLeadsCheckbox = page.getByRole('checkbox', { name: 'Decline leads' });
  await expect(declineLeadsCheckbox).not.toBeChecked();
  await declineLeadsCheckbox.check();
  await page.getByRole('button', { name: 'Save permissions' }).click();
  await expect(page.getByText('Saved', { exact: false })).toBeVisible();

  // Create a new custom role.
  await page.getByRole('button', { name: 'New role' }).click();
  await page.getByPlaceholder(/Key \(e\.g\./i).fill('regional-lead');
  await page.getByPlaceholder('Name', { exact: true }).fill('Regional Lead');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('button', { name: /Regional Lead/i })).toBeVisible();
});

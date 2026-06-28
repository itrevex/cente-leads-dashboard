import { test, expect } from './fixtures/test';

test('renders products and supports create, duplicate, and settings update flows', async ({
  page,
}) => {
  await page.goto('/products');

  await expect(page.getByRole('heading', { name: 'Loan Products' })).toBeVisible();
  await expect(page.getByText('Salary Advance')).toBeVisible();

  await page.getByRole('button', { name: /New Product/i }).click();
  await page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: 'Create' }) })
    .getByLabel('Code')
    .fill('BUS-002');
  await page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: 'Create' }) })
    .getByLabel('Name')
    .fill('Business Booster');
  await page.getByLabel('Segment').selectOption('business');
  await page.getByLabel('Min amount (UGX)').fill('150000');
  await page.getByLabel('Max amount (UGX)').fill('2500000');
  await page.getByLabel('Interest rate (bps)').fill('2200');
  await page.getByLabel('Min term (mo)').fill('2');
  await page.getByLabel('Max term (mo)').fill('9');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByText('Business Booster')).toBeVisible();

  await page
    .getByRole('row', { name: /Business Booster/i })
    .locator('input[type="radio"]')
    .check();
  await page.getByRole('button', { name: /Duplicate/i }).click();
  await expect(page.getByText('Business Booster Copy')).toBeVisible();

  await page.getByRole('cell', { name: 'Salary Advance' }).click();
  await expect(page).toHaveURL(/\/products\/product-salary-001$/);

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.locator('#product-settings-name').fill('Salary Advance Plus');
  await page.locator('#product-settings-processing-fee').fill('300');
  await page.getByPlaceholder('Search branches…').fill('jinja');
  await expect(page.getByRole('button', { name: 'Jinja Branch' })).toBeVisible();
  await page.getByPlaceholder('Search branches…').fill('');
  await page.getByRole('button', { name: 'Select all' }).click();
  await page.getByRole('button', { name: 'Clear all' }).click();
  await page.getByRole('button', { name: 'Jinja Branch' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText('Saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Salary Advance Plus' })).toBeVisible();

  await page.getByRole('button', { name: 'Version History' }).click();
  await expect(page.getByRole('heading', { name: 'Version history' })).toBeVisible();
  await expect(page.getByText('Version 1')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: 'Loan Steps' }).click();
  await page.getByRole('button', { name: 'Add step' }).click();
  await page.locator('#step-form-name').fill('Credit Committee Review');
  await page.locator('#step-form-performed-by').selectOption('loan_officer');
  await page.locator('#step-form-sla-hours').fill('36');
  await page.locator('#step-form-icon').selectOption('check_circle');
  await page
    .locator('#step-form-description')
    .fill('Committee checks complete submission details.');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Credit Committee Review')).toBeVisible();
  await page
    .getByText('2. Credit Committee Review')
    .dragTo(page.getByText('1. Applicant Details').first());
  await expect(page.getByText('1. Credit Committee Review')).toBeVisible();

  await page.getByRole('button', { name: 'Application Form' }).click();
  await page.getByRole('button', { name: 'Add field' }).first().click();
  await page.locator('#field-form-key').fill('committee_notes');
  await page.locator('#field-form-label').fill('Committee Notes');
  await page.locator('#field-form-type').selectOption('textarea');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Committee Notes')).toBeVisible();
  await page.getByRole('button', { name: /Edit field Committee Notes/i }).click();
  await page.locator('#field-form-label').fill('Committee Review Notes');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Committee Review Notes')).toBeVisible();
  await page.getByText('Committee Review Notes').dragTo(page.getByText('Applicant Name').first());
  await page.getByRole('button', { name: /Delete field Committee Review Notes/i }).click();
  await expect(page.getByText('Committee Review Notes')).toHaveCount(0);

  await page.getByRole('button', { name: 'Documents' }).click();
  await page.getByRole('button', { name: 'Add document' }).click();
  await page.locator('#document-form-name').fill('Employment Confirmation Letter');
  await page.locator('#document-form-accepted-format').selectOption('pdf_only');
  await page.locator('#document-form-order').fill('2');
  await page.locator('#document-form-description').fill('Letter signed by employer HR.');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Employment Confirmation Letter')).toBeVisible();
  await page.getByRole('button', { name: /Edit document Employment Confirmation Letter/i }).click();
  await page.locator('#document-form-order').fill('3');
  await page.getByRole('button', { name: 'Save' }).click();
  await page
    .getByRole('button', { name: /Delete document Employment Confirmation Letter/i })
    .click();
  await expect(page.getByText('Employment Confirmation Letter')).toHaveCount(0);

  await page.getByRole('button', { name: 'Loan Steps' }).click();
  await page.getByRole('button', { name: /Delete step Credit Committee Review/i }).click();
  await expect(page.getByText('Credit Committee Review')).toHaveCount(0);

  await page.getByRole('button', { name: 'Publish' }).click();
  await expect(page.getByText('Published')).toBeVisible();
  await expect(page.getByText(/editing is locked/i)).toBeVisible();

  await page.getByRole('button', { name: 'New draft version' }).click();
  await expect(page.getByText(/Version 2/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();

  await page.goto('/products');
  await page.getByText('Business Booster', { exact: true }).first().click();
  await expect(page).toHaveURL(/\/products\/product-2$/);
  await expect(page.getByText('No form schema yet for this product.')).toBeVisible();
  await page.getByRole('button', { name: 'Create draft version' }).click();
  await expect(page.getByText(/Version 1/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
});

import { test, expect } from './fixtures/test';

test('covers product config edge states and cancel paths', async ({ page }) => {
  await page.goto('/products/product-salary-001');

  await page.getByRole('button', { name: 'Loan Steps' }).click();
  await page.getByRole('button', { name: 'Add step' }).click();
  await page.locator('#step-form-name').fill('Temporary Step');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Temporary Step')).toHaveCount(0);

  await page.getByRole('button', { name: 'Application Form' }).click();
  await page.getByRole('button', { name: 'Add field' }).first().click();
  await page.locator('#field-form-key').fill('temp_field');
  await page.locator('#field-form-label').fill('Temporary Field');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Temporary Field')).toHaveCount(0);

  await page.getByRole('button', { name: 'Documents' }).click();
  await page.getByRole('button', { name: 'Add document' }).click();
  await page.locator('#document-form-name').fill('Temporary Document');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Temporary Document')).toHaveCount(0);

  await page.goto('/products');
  await page.getByRole('button', { name: /New Product/i }).click();
  await page.locator('#product-create-code').fill('EDGE-001');
  await page.locator('#product-create-name').fill('Edge Product');
  await page.locator('#product-create-segment').selectOption('business');
  await page.locator('#product-create-min-amount').fill('100000');
  await page.locator('#product-create-max-amount').fill('500000');
  await page.locator('#product-create-interest-rate').fill('2000');
  await page.locator('#product-create-min-term').fill('1');
  await page.locator('#product-create-max-term').fill('6');
  await page.getByRole('button', { name: 'Create' }).click();

  await page.getByText('Edge Product', { exact: true }).first().click();
  await expect(page).toHaveURL(/\/products\/product-\d+$/);
  await expect(page.getByText('No form schema yet for this product.')).toBeVisible();

  await page.getByRole('button', { name: 'Version History' }).click();
  await expect(page.getByText('No versions yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: 'Create draft version' }).click();
  await expect(page.getByText(/Version 1/i)).toBeVisible();

  await page.getByRole('button', { name: 'Loan Steps' }).click();
  await expect(page.getByText('No steps yet.')).toBeVisible();

  await page.getByRole('button', { name: 'Application Form' }).click();
  await expect(
    page.getByText('Add steps in the Loan Steps tab before adding fields.'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Documents' }).click();
  await expect(page.getByText('No document requirements yet.')).toBeVisible();
});

import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ProductsListPage from './ProductsListPage';

const { ProductsApiError, createProduct, duplicateProduct } = vi.hoisted(() => ({
  ProductsApiError: class ProductsApiError extends Error {
    constructor(
      public status: number,
      public body: unknown,
    ) {
      super(`Products API request failed with status ${status}`);
    }
  },
  createProduct: vi.fn(),
  duplicateProduct: vi.fn(),
}));

vi.mock('../client', () => ({
  ProductsApiError,
  createProduct: (...args: unknown[]) => createProduct(...args),
  duplicateProduct: (...args: unknown[]) => duplicateProduct(...args),
}));

describe('ProductsListPage', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    createProduct.mockReset();
    duplicateProduct.mockReset();
  });

  it('renders empty state for read-only users', () => {
    render(<ProductsListPage initialProducts={[]} canManage={false} />);

    expect(screen.getByText('0 products configured')).toBeTruthy();
    expect(screen.getByText('No loan products yet.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'New Product' })).toBeNull();
  });

  it('creates a product and surfaces duplicate/create failures', async () => {
    createProduct
      .mockRejectedValueOnce(new ProductsApiError(422, { detail: 'bad payload' }))
      .mockResolvedValueOnce({
        id: 'product-2',
        code: 'BUS-001',
        name: 'Business Loan',
        segment: 'business',
        description: '',
        min_amount: 100000,
        max_amount: 500000,
        currency: 'UGX',
        interest_rate_bps: 2000,
        processing_fee_bps: 100,
        min_term_months: 1,
        max_term_months: 6,
        requires_chair_approval: false,
        active_form_schema: null,
        branch_availability: [],
        is_active: true,
        applications_mtd: 0,
        approval_rate: null,
        created_at: '2026-06-27T00:00:00Z',
        updated_at: '2026-06-27T00:00:00Z',
      });
    duplicateProduct.mockResolvedValueOnce({
      id: 'product-3',
      code: 'SAL-001-COPY',
      name: 'Salary Advance Copy',
      segment: 'salary',
      description: '',
      min_amount: 100000,
      max_amount: 500000,
      currency: 'UGX',
      interest_rate_bps: 1800,
      processing_fee_bps: 100,
      min_term_months: 1,
      max_term_months: 6,
      requires_chair_approval: false,
      active_form_schema: null,
      branch_availability: [],
      is_active: true,
      applications_mtd: 0,
      approval_rate: null,
      created_at: '2026-06-27T00:00:00Z',
      updated_at: '2026-06-27T00:00:00Z',
    });

    render(
      <ProductsListPage
        canManage
        initialProducts={[
          {
            id: 'product-1',
            code: 'SAL-001',
            name: 'Salary Advance',
            segment: 'salary',
            description: '',
            min_amount: 100000,
            max_amount: 500000,
            currency: 'UGX',
            interest_rate_bps: 1800,
            processing_fee_bps: 100,
            min_term_months: 1,
            max_term_months: 6,
            requires_chair_approval: false,
            active_form_schema: null,
            branch_availability: [],
            is_active: true,
            applications_mtd: 2,
            approval_rate: null,
            created_at: '2026-06-27T00:00:00Z',
            updated_at: '2026-06-27T00:00:00Z',
          },
        ]}
      />,
    );

    expect(screen.getByText('1 product configured')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Duplicate' }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    await userEvent.click(screen.getByRole('button', { name: 'New Product' }));
    await userEvent.type(screen.getByLabelText('Code'), 'BUS-001');
    await userEvent.type(screen.getByLabelText('Name'), 'Business Loan');
    await userEvent.clear(screen.getByLabelText('Min amount (UGX)'));
    await userEvent.type(screen.getByLabelText('Min amount (UGX)'), '1000');
    await userEvent.clear(screen.getByLabelText('Max amount (UGX)'));
    await userEvent.type(screen.getByLabelText('Max amount (UGX)'), '5000');
    await userEvent.clear(screen.getByLabelText('Interest rate (bps)'));
    await userEvent.type(screen.getByLabelText('Interest rate (bps)'), '2000');
    await userEvent.clear(screen.getByLabelText('Min term (mo)'));
    await userEvent.type(screen.getByLabelText('Min term (mo)'), '1');
    await userEvent.clear(screen.getByLabelText('Max term (mo)'));
    await userEvent.type(screen.getByLabelText('Max term (mo)'), '6');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    await screen.findByText('{"detail":"bad payload"}');

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    await screen.findByText('Business Loan');

    (screen.getAllByRole('radio')[0] as HTMLInputElement).click();
    expect((screen.getByRole('button', { name: 'Duplicate' }) as HTMLButtonElement).disabled).toBe(
      false,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Duplicate' }));
    await screen.findByText('Salary Advance Copy');
  });

  it('shows busy labels while create and duplicate requests are in flight', async () => {
    let resolveCreate: (value: unknown) => void;
    let resolveDuplicate: (value: unknown) => void;

    createProduct.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    duplicateProduct.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDuplicate = resolve;
      }),
    );

    render(
      <ProductsListPage
        canManage
        initialProducts={[
          {
            id: 'product-1',
            code: 'SAL-001',
            name: 'Salary Advance',
            segment: 'salary',
            description: '',
            min_amount: 100000,
            max_amount: 500000,
            currency: 'UGX',
            interest_rate_bps: 1800,
            processing_fee_bps: 100,
            min_term_months: 1,
            max_term_months: 6,
            requires_chair_approval: false,
            active_form_schema: null,
            branch_availability: [],
            is_active: true,
            applications_mtd: 2,
            approval_rate: null,
            created_at: '2026-06-27T00:00:00Z',
            updated_at: '2026-06-27T00:00:00Z',
          },
        ]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'New Product' }));
    await userEvent.type(screen.getByLabelText('Code'), 'BUS-002');
    await userEvent.type(screen.getByLabelText('Name'), 'Pending Product');
    await userEvent.clear(screen.getByLabelText('Min amount (UGX)'));
    await userEvent.type(screen.getByLabelText('Min amount (UGX)'), '1000');
    await userEvent.clear(screen.getByLabelText('Max amount (UGX)'));
    await userEvent.type(screen.getByLabelText('Max amount (UGX)'), '5000');
    await userEvent.clear(screen.getByLabelText('Interest rate (bps)'));
    await userEvent.type(screen.getByLabelText('Interest rate (bps)'), '2000');
    await userEvent.clear(screen.getByLabelText('Min term (mo)'));
    await userEvent.type(screen.getByLabelText('Min term (mo)'), '1');
    await userEvent.clear(screen.getByLabelText('Max term (mo)'));
    await userEvent.type(screen.getByLabelText('Max term (mo)'), '6');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeTruthy();
    resolveCreate!({
      id: 'product-2',
      code: 'BUS-002',
      name: 'Pending Product',
      segment: 'business',
      description: '',
      min_amount: 100000,
      max_amount: 500000,
      currency: 'UGX',
      interest_rate_bps: 2000,
      processing_fee_bps: 100,
      min_term_months: 1,
      max_term_months: 6,
      requires_chair_approval: false,
      active_form_schema: null,
      branch_availability: [],
      is_active: true,
      applications_mtd: 0,
      approval_rate: null,
      created_at: '2026-06-27T00:00:00Z',
      updated_at: '2026-06-27T00:00:00Z',
    });
    await screen.findByText('Pending Product');

    (screen.getAllByRole('radio')[0] as HTMLInputElement).click();
    await userEvent.click(screen.getByRole('button', { name: 'Duplicate' }));
    expect(screen.getByRole('button', { name: 'Duplicating…' })).toBeTruthy();
    resolveDuplicate!({
      id: 'product-3',
      code: 'SAL-001-COPY',
      name: 'Salary Advance Copy',
      segment: 'salary',
      description: '',
      min_amount: 100000,
      max_amount: 500000,
      currency: 'UGX',
      interest_rate_bps: 1800,
      processing_fee_bps: 100,
      min_term_months: 1,
      max_term_months: 6,
      requires_chair_approval: false,
      active_form_schema: null,
      branch_availability: [],
      is_active: true,
      applications_mtd: 0,
      approval_rate: null,
      created_at: '2026-06-27T00:00:00Z',
      updated_at: '2026-06-27T00:00:00Z',
    });
    await screen.findByText('Salary Advance Copy');
  });

  it('surfaces a generic duplicate failure after a product is selected', async () => {
    duplicateProduct.mockRejectedValueOnce(new Error('duplicate failed'));

    render(
      <ProductsListPage
        canManage
        initialProducts={[
          {
            id: 'product-1',
            code: 'SAL-001',
            name: 'Salary Advance',
            segment: 'salary',
            description: '',
            min_amount: 100000,
            max_amount: 500000,
            currency: 'UGX',
            interest_rate_bps: 1800,
            processing_fee_bps: 100,
            min_term_months: 1,
            max_term_months: 6,
            requires_chair_approval: false,
            active_form_schema: null,
            branch_availability: [],
            is_active: true,
            applications_mtd: 2,
            approval_rate: null,
            created_at: '2026-06-27T00:00:00Z',
            updated_at: '2026-06-27T00:00:00Z',
          },
        ]}
      />,
    );

    (screen.getAllByRole('radio')[0] as HTMLInputElement).click();
    await userEvent.click(screen.getByRole('button', { name: 'Duplicate' }));
    await waitFor(() => {
      expect(duplicateProduct).toHaveBeenCalledWith('product-1');
    });
  });
});

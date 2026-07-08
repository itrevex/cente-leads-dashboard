import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsTab from './SettingsTab';
import type { LoanProduct } from '../types';

const { ProductsApiError, updateProduct } = vi.hoisted(() => ({
  ProductsApiError: class ProductsApiError extends Error {
    constructor(
      public status: number,
      public body: unknown,
    ) {
      super(`Products API request failed with status ${status}`);
    }
  },
  updateProduct: vi.fn(),
}));

vi.mock('../client', () => ({
  ProductsApiError,
  updateProduct: (...args: unknown[]) => updateProduct(...args),
}));

const product: LoanProduct = {
  id: 'product-1',
  code: 'SAL-001',
  name: 'Salary Advance',
  segment: 'salary',
  description: 'desc',
  min_amount: 100000,
  max_amount: 500000,
  currency: 'UGX',
  interest_rate_bps: 1800,
  processing_fee_bps: 200,
  min_term_months: 1,
  max_term_months: 12,
  requires_chair_approval: false,
  active_form_schema: 'schema-1',
  branch_availability: ['branch-kampala'],
  is_active: true,
  applications_mtd: 2,
  approval_rate: 80,
  has_draft_schema: false,
  created_at: '2026-06-27T00:00:00Z',
  updated_at: '2026-06-27T00:00:00Z',
};

const branchOptions = [
  { id: 'branch-kampala', name: 'Kampala Main' },
  { id: 'branch-mukono', name: 'Mukono Branch' },
  { id: 'branch-jinja', name: 'Jinja Branch' },
  { id: 'branch-mbarara', name: 'Mbarara Branch' },
  { id: 'branch-gulu', name: 'Gulu Branch' },
  { id: 'branch-lira', name: 'Lira Branch' },
  { id: 'branch-mbale', name: 'Mbale Branch' },
  { id: 'branch-arua', name: 'Arua Branch' },
  { id: 'branch-masaka', name: 'Masaka Branch' },
];

describe('SettingsTab', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    updateProduct.mockReset();
  });

  it('filters branches, toggles select-all, and saves changes', async () => {
    const onSaved = vi.fn();
    updateProduct.mockResolvedValue({
      ...product,
      name: 'Salary Advance Plus',
      branch_availability: ['branch-jinja'],
    });

    render(
      <SettingsTab product={product} branchOptions={branchOptions} canManage onSaved={onSaved} />,
    );

    await userEvent.clear(screen.getByLabelText('Name'));
    await userEvent.type(screen.getByLabelText('Name'), 'Salary Advance Plus');
    await userEvent.type(screen.getByPlaceholderText('Search branches…'), 'jinja');
    expect(screen.getByRole('button', { name: 'Jinja Branch' })).toBeTruthy();
    await userEvent.clear(screen.getByPlaceholderText('Search branches…'));
    await userEvent.click(screen.getByRole('button', { name: 'Select all' }));
    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    await userEvent.click(screen.getByRole('button', { name: 'Jinja Branch' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateProduct).toHaveBeenCalledWith(
        'product-1',
        expect.objectContaining({
          name: 'Salary Advance Plus',
          branch_availability: ['branch-jinja'],
        }),
      );
      expect(onSaved).toHaveBeenCalled();
    });

    expect(screen.getByText('Saved')).toBeTruthy();
  });

  it('renders save errors and disabled controls for read-only users', async () => {
    updateProduct.mockRejectedValue(new ProductsApiError(400, { detail: 'save failed' }));

    const { rerender } = render(
      <SettingsTab product={product} branchOptions={branchOptions} canManage onSaved={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByText('{"detail":"save failed"}');

    rerender(
      <SettingsTab product={product} branchOptions={[]} canManage={false} onSaved={vi.fn()} />,
    );

    expect(screen.getByText('No branches available.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save changes' })).toBeNull();
  });
});

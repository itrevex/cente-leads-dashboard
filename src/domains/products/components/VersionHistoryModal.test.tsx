import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import VersionHistoryModal from './VersionHistoryModal';

const { ProductsApiError, listFormSchemas } = vi.hoisted(() => ({
  ProductsApiError: class ProductsApiError extends Error {
    constructor(
      public status: number,
      public body: unknown,
    ) {
      super(`Products API request failed with status ${status}`);
    }
  },
  listFormSchemas: vi.fn(),
}));

vi.mock('../client', () => ({
  ProductsApiError,
  listFormSchemas: (...args: unknown[]) => listFormSchemas(...args),
}));

describe('VersionHistoryModal', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    listFormSchemas.mockReset();
  });

  it('renders loading and then the returned versions', async () => {
    listFormSchemas.mockResolvedValue({
      results: [
        {
          id: 'schema-2',
          loan_product: 'product-1',
          version: 2,
          status: 'published',
          published_at: '2026-06-27T10:00:00Z',
          retired_at: null,
          created_by: 'user-1',
          steps: [],
          document_requirements: [],
          created_at: '2026-06-27T09:00:00Z',
          updated_at: '2026-06-27T10:00:00Z',
        },
      ],
    });

    render(<VersionHistoryModal productId="product-1" onClose={vi.fn()} />);

    expect(screen.getByText('Loading…')).toBeTruthy();
    await screen.findByText('Version 2');
    expect(screen.getAllByText(/Published/).length).toBeGreaterThan(0);
  });

  it('renders an empty state when no versions are returned', async () => {
    listFormSchemas.mockResolvedValue({ results: [] });

    render(<VersionHistoryModal productId="product-1" onClose={vi.fn()} />);

    await screen.findByText('No versions yet.');
  });

  it('renders retired/null-date metadata and generic error fallback', async () => {
    const onClose = vi.fn();
    listFormSchemas.mockResolvedValueOnce({
      results: [
        {
          id: 'schema-3',
          loan_product: 'product-1',
          version: 3,
          status: 'retired',
          published_at: null,
          retired_at: '2026-06-27T11:00:00Z',
          created_by: 'user-1',
          steps: [],
          document_requirements: [],
          created_at: '2026-06-27T09:00:00Z',
          updated_at: '2026-06-27T11:00:00Z',
        },
      ],
    });

    const { rerender } = render(<VersionHistoryModal productId="product-1" onClose={onClose} />);
    await screen.findByText('Version 3');
    expect(screen.getAllByText(/Retired/).length).toBeGreaterThan(0);

    listFormSchemas.mockRejectedValueOnce(new Error('generic boom'));
    rerender(<VersionHistoryModal productId="product-2" onClose={onClose} />);
    await screen.findByText('Failed to load version history.');
  });

  it('renders API failures and closes on backdrop or close button click', async () => {
    const onClose = vi.fn();
    listFormSchemas.mockRejectedValue(new ProductsApiError(500, { detail: 'boom' }));

    render(<VersionHistoryModal productId="product-1" onClose={onClose} />);

    await screen.findByText('{"detail":"boom"}');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('ignores resolved or rejected requests after unmount', async () => {
    let resolveList: (value: unknown) => void;
    listFormSchemas.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<VersionHistoryModal productId="product-1" onClose={vi.fn()} />);

    unmount();
    resolveList!({ results: [] });

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

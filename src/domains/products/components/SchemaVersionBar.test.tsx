import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SchemaVersionBar from './SchemaVersionBar';
import type { LeadFormSchema, LoanProduct } from '../types';

const { ProductsApiError, createFormSchema, publishFormSchema } = vi.hoisted(() => ({
  ProductsApiError: class ProductsApiError extends Error {
    constructor(
      public status: number,
      public body: unknown,
    ) {
      super(`Products API request failed with status ${status}`);
    }
  },
  createFormSchema: vi.fn(),
  publishFormSchema: vi.fn(),
}));

vi.mock('../client', () => ({
  ProductsApiError,
  createFormSchema: (...args: unknown[]) => createFormSchema(...args),
  publishFormSchema: (...args: unknown[]) => publishFormSchema(...args),
}));

const product: LoanProduct = {
  id: 'product-1',
  code: 'SAL-001',
  name: 'Salary Advance',
  segment: 'salary',
  description: 'desc',
  min_amount: 100,
  max_amount: 200,
  currency: 'UGX',
  interest_rate_bps: 100,
  processing_fee_bps: 50,
  min_term_months: 1,
  max_term_months: 12,
  requires_chair_approval: false,
  active_form_schema: null,
  branch_availability: [],
  is_active: true,
  applications_mtd: 0,
  approval_rate: null,
  has_draft_schema: false,
  created_at: '2026-06-27T00:00:00Z',
  updated_at: '2026-06-27T00:00:00Z',
};

const draftSchema = {
  id: 'schema-1',
  loan_product: 'product-1',
  version: 1,
  status: 'draft',
  published_at: null,
  retired_at: null,
  created_by: 'user-1',
  steps: [],
  document_requirements: [],
  created_at: '2026-06-27T00:00:00Z',
  updated_at: '2026-06-27T00:00:00Z',
} as const;

describe('SchemaVersionBar', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    createFormSchema.mockReset();
    publishFormSchema.mockReset();
  });

  it('creates the first draft when no schema exists', async () => {
    const onSchemaChange = vi.fn();
    createFormSchema.mockResolvedValue({ ...draftSchema });

    render(
      <SchemaVersionBar
        product={product}
        schema={null}
        canManage
        onSchemaChange={onSchemaChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Create draft version' }));

    await waitFor(() => {
      expect(createFormSchema).toHaveBeenCalledWith('product-1', undefined);
      expect(onSchemaChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'schema-1' }));
    });
  });

  it('publishes a draft schema', async () => {
    const onSchemaChange = vi.fn();
    publishFormSchema.mockResolvedValue({
      ...draftSchema,
      status: 'published',
      published_at: '2026-06-27T10:00:00Z',
    });

    render(
      <SchemaVersionBar
        product={product}
        schema={draftSchema as unknown as LeadFormSchema}
        canManage
        onSchemaChange={onSchemaChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() => {
      expect(publishFormSchema).toHaveBeenCalledWith('schema-1');
      expect(onSchemaChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }));
    });
  });

  it('creates a new draft from a published schema and shows locked editing text', async () => {
    const onSchemaChange = vi.fn();
    createFormSchema.mockResolvedValue({ ...draftSchema, version: 2 });

    render(
      <SchemaVersionBar
        product={product}
        schema={
          {
            ...draftSchema,
            status: 'published',
            published_at: '2026-06-27T10:00:00Z',
          } as unknown as LeadFormSchema
        }
        canManage
        onSchemaChange={onSchemaChange}
      />,
    );

    expect(screen.getByText(/editing is locked/i)).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'New draft version' }));

    await waitFor(() => {
      expect(createFormSchema).toHaveBeenCalledWith('product-1', 1);
      expect(onSchemaChange).toHaveBeenCalledWith(expect.objectContaining({ version: 2 }));
    });
  });

  it('renders API errors from create and publish actions', async () => {
    createFormSchema.mockRejectedValue(new ProductsApiError(400, { detail: 'create failed' }));
    publishFormSchema.mockRejectedValue(new ProductsApiError(400, { detail: 'publish failed' }));

    const { rerender } = render(
      <SchemaVersionBar product={product} schema={null} canManage onSchemaChange={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Create draft version' }));
    await screen.findByText('{"detail":"create failed"}');

    rerender(
      <SchemaVersionBar
        product={product}
        schema={draftSchema as unknown as LeadFormSchema}
        canManage
        onSchemaChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));
    await screen.findByText('{"detail":"publish failed"}');
  });

  it('hides actions when the user cannot manage and shows generic fallback errors', async () => {
    const { rerender } = render(
      <SchemaVersionBar
        product={product}
        schema={null}
        canManage={false}
        onSchemaChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Create draft version' })).toBeNull();

    createFormSchema.mockRejectedValueOnce(new Error('fallback create'));
    rerender(
      <SchemaVersionBar product={product} schema={null} canManage onSchemaChange={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create draft version' }));
    await screen.findByText('Failed to create draft.');

    publishFormSchema.mockRejectedValueOnce(new Error('fallback publish'));
    rerender(
      <SchemaVersionBar
        product={product}
        schema={draftSchema as unknown as LeadFormSchema}
        canManage
        onSchemaChange={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));
    await screen.findByText('Failed to publish.');
  });

  it('shows busy labels while create and publish requests are in flight', async () => {
    let resolveCreate: (value: unknown) => void;
    let resolvePublish: (value: unknown) => void;

    createFormSchema.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    publishFormSchema.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePublish = resolve;
      }),
    );

    const { rerender } = render(
      <SchemaVersionBar product={product} schema={null} canManage onSchemaChange={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Create draft version' }));
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeTruthy();
    resolveCreate!({ ...draftSchema });
    await waitFor(() => expect(createFormSchema).toHaveBeenCalled());

    rerender(
      <SchemaVersionBar
        product={product}
        schema={draftSchema as unknown as LeadFormSchema}
        canManage
        onSchemaChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));
    expect(screen.getByRole('button', { name: 'Publishing…' })).toBeTruthy();
    resolvePublish!({ ...draftSchema, status: 'published' });
    await waitFor(() => expect(publishFormSchema).toHaveBeenCalled());
  });
});

import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LoanStepsTab from './LoanStepsTab';
import { fireEvent } from '@testing-library/react';
import type { LoanProduct, LeadFormSchema } from '../types';

const { ProductsApiError, createStep, updateStep, deleteStep } = vi.hoisted(() => ({
  ProductsApiError: class ProductsApiError extends Error {
    constructor(
      public status: number,
      public body: unknown,
    ) {
      super(`Products API request failed with status ${status}`);
    }
  },
  createStep: vi.fn(),
  updateStep: vi.fn(),
  deleteStep: vi.fn(),
}));

vi.mock('../client', () => ({
  ProductsApiError,
  createStep: (...args: unknown[]) => createStep(...args),
  updateStep: (...args: unknown[]) => updateStep(...args),
  deleteStep: (...args: unknown[]) => deleteStep(...args),
}));

vi.mock('./SchemaVersionBar', () => ({
  default: () => <div>Schema bar</div>,
}));

describe('LoanStepsTab', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    createStep.mockReset();
    updateStep.mockReset();
    deleteStep.mockReset();
  });

  const product = {
    id: 'product-1',
    code: 'SAL-001',
    name: 'Salary Advance',
  } as unknown as LoanProduct;

  it('renders empty and read-only states for schema branches', () => {
    const { rerender } = render(
      <LoanStepsTab
        product={product}
        schema={
          {
            id: 'schema-1',
            steps: [],
            document_requirements: [],
          } as unknown as LeadFormSchema
        }
        canManage
        isEditable
        onSchemaChange={vi.fn()}
        onSchemaRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText('No steps yet.')).toBeTruthy();

    rerender(
      <LoanStepsTab
        product={product}
        schema={
          {
            id: 'schema-1',
            steps: [
              {
                id: 'step-1',
                name: 'Applicant Details',
                description: '',
                performed_by: 'branch_officer',
                sla_hours: 12,
                icon: 'user',
                order: 1,
                form_fields: [],
              },
            ],
            document_requirements: [],
          } as unknown as LeadFormSchema
        }
        canManage
        isEditable={false}
        onSchemaChange={vi.fn()}
        onSchemaRefresh={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Add step' })).toBeNull();
  });

  it('shows drag hint and reorders steps', async () => {
    const onSchemaRefresh = vi.fn();
    updateStep.mockResolvedValue({ id: 'step-1' });

    render(
      <LoanStepsTab
        product={product}
        schema={
          {
            id: 'schema-1',
            steps: [
              {
                id: 'step-1',
                name: 'Applicant Details',
                description: '',
                performed_by: 'branch_officer',
                sla_hours: 12,
                icon: 'user',
                order: 1,
                form_fields: [],
              },
              {
                id: 'step-2',
                name: 'Review',
                description: '',
                performed_by: 'loan_officer',
                sla_hours: 24,
                icon: 'check_circle',
                order: 2,
                form_fields: [],
              },
            ],
            document_requirements: [],
          } as unknown as LeadFormSchema
        }
        canManage
        isEditable
        onSchemaChange={vi.fn()}
        onSchemaRefresh={onSchemaRefresh}
      />,
    );

    expect(screen.getByText('Drag to reorder')).toBeTruthy();

    const first =
      screen.getByText('1. Applicant Details').closest('div[draggable="true"]') ??
      screen.getByText('1. Applicant Details');
    const second =
      screen.getByText('2. Review').closest('div[draggable="true"]') ??
      screen.getByText('2. Review');
    fireEvent.dragStart(second);
    fireEvent.dragOver(first);
    fireEvent.drop(first);

    await waitFor(() => {
      expect(updateStep).toHaveBeenCalled();
      expect(onSchemaRefresh).toHaveBeenCalledWith('schema-1');
    });
  });

  it('ignores invalid drops and surfaces reorder errors', async () => {
    const onSchemaRefresh = vi.fn();
    updateStep.mockRejectedValueOnce(new ProductsApiError(400, { detail: 'reorder failed' }));

    render(
      <LoanStepsTab
        product={product}
        schema={
          {
            id: 'schema-1',
            steps: [
              {
                id: 'step-1',
                name: 'Applicant Details',
                description: '',
                performed_by: 'branch_officer',
                sla_hours: 12,
                icon: 'user',
                order: 1,
                form_fields: [],
              },
              {
                id: 'step-2',
                name: 'Review',
                description: '',
                performed_by: 'loan_officer',
                sla_hours: 24,
                icon: 'check_circle',
                order: 2,
                form_fields: [],
              },
            ],
            document_requirements: [],
          } as unknown as LeadFormSchema
        }
        canManage
        isEditable
        onSchemaChange={vi.fn()}
        onSchemaRefresh={onSchemaRefresh}
      />,
    );

    const first =
      screen.getByText('1. Applicant Details').closest('div[draggable="true"]') ??
      screen.getByText('1. Applicant Details');
    const second =
      screen.getByText('2. Review').closest('div[draggable="true"]') ??
      screen.getByText('2. Review');

    fireEvent.drop(first);
    expect(updateStep).not.toHaveBeenCalled();

    fireEvent.dragStart(first);
    fireEvent.drop(first);
    expect(updateStep).not.toHaveBeenCalled();

    fireEvent.dragStart(second);
    fireEvent.dragOver(first);
    fireEvent.drop(first);
    await waitFor(() => {
      expect(updateStep).toHaveBeenCalled();
    });
    expect(onSchemaRefresh).not.toHaveBeenCalled();
  });

  it('creates, updates, and deletes steps', async () => {
    const onSchemaRefresh = vi.fn();
    createStep.mockResolvedValue({ id: 'step-2' });
    updateStep.mockResolvedValue({ id: 'step-1' });
    deleteStep.mockResolvedValue(null);

    render(
      <LoanStepsTab
        product={product}
        schema={
          {
            id: 'schema-1',
            steps: [
              {
                id: 'step-1',
                name: 'Applicant Details',
                description: '',
                performed_by: 'branch_officer',
                sla_hours: 12,
                icon: 'user',
                order: 1,
                form_fields: [],
              },
            ],
            document_requirements: [],
          } as unknown as LeadFormSchema
        }
        canManage
        isEditable
        onSchemaChange={vi.fn()}
        onSchemaRefresh={onSchemaRefresh}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add step' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Credit Review');
    await userEvent.type(screen.getByLabelText('Description'), 'Review docs');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(createStep).toHaveBeenCalledWith(
        'schema-1',
        expect.objectContaining({ name: 'Credit Review' }),
      );
      expect(onSchemaRefresh).toHaveBeenCalledWith('schema-1');
    });

    await userEvent.click(screen.getByRole('button', { name: /Edit step Applicant Details/i }));
    await userEvent.clear(screen.getByLabelText('Name'));
    await userEvent.type(screen.getByLabelText('Name'), 'Applicant Intake');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateStep).toHaveBeenCalledWith(
        'schema-1',
        'step-1',
        expect.objectContaining({ name: 'Applicant Intake' }),
      );
    });

    await userEvent.click(screen.getByRole('button', { name: /Delete step Applicant Details/i }));
    await waitFor(() => {
      expect(deleteStep).toHaveBeenCalledWith('schema-1', 'step-1');
    });
  });

  it('renders API-shaped errors for create, update, and delete failures', async () => {
    createStep.mockRejectedValueOnce(new ProductsApiError(400, { detail: 'create failed' }));
    updateStep.mockRejectedValueOnce(new ProductsApiError(400, { detail: 'update failed' }));
    deleteStep.mockRejectedValueOnce(new ProductsApiError(400, { detail: 'delete failed' }));

    render(
      <LoanStepsTab
        product={product}
        schema={
          {
            id: 'schema-1',
            steps: [
              {
                id: 'step-1',
                name: 'Applicant Details',
                description: '',
                performed_by: 'branch_officer',
                sla_hours: 12,
                icon: 'user',
                order: 1,
                form_fields: [],
              },
            ],
            document_requirements: [],
          } as unknown as LeadFormSchema
        }
        canManage
        isEditable
        onSchemaChange={vi.fn()}
        onSchemaRefresh={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add step' }));
    await userEvent.type(screen.getByLabelText('Name'), 'Broken Step');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('{"detail":"create failed"}');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await userEvent.click(screen.getByRole('button', { name: /Edit step Applicant Details/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('{"detail":"update failed"}');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await userEvent.click(screen.getByRole('button', { name: /Delete step Applicant Details/i }));
    await waitFor(() => {
      expect(deleteStep).toHaveBeenCalledWith('schema-1', 'step-1');
    });
  });
});

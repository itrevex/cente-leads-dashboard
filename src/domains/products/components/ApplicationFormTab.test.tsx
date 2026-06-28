import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ApplicationFormTab from './ApplicationFormTab';
import { fireEvent } from '@testing-library/react';
import type { LoanProduct, LeadFormSchema } from '../types';

const { ProductsApiError, createField, updateField, deleteField } = vi.hoisted(() => ({
  ProductsApiError: class ProductsApiError extends Error {
    constructor(
      public status: number,
      public body: unknown,
    ) {
      super(`Products API request failed with status ${status}`);
    }
  },
  createField: vi.fn(),
  updateField: vi.fn(),
  deleteField: vi.fn(),
}));

vi.mock('../client', () => ({
  ProductsApiError,
  createField: (...args: unknown[]) => createField(...args),
  updateField: (...args: unknown[]) => updateField(...args),
  deleteField: (...args: unknown[]) => deleteField(...args),
}));

vi.mock('./SchemaVersionBar', () => ({
  default: () => <div>Schema bar</div>,
}));

describe('ApplicationFormTab', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    createField.mockReset();
    updateField.mockReset();
    deleteField.mockReset();
  });

  const product = {
    id: 'product-1',
    code: 'SAL-001',
    name: 'Salary Advance',
  } as unknown as LoanProduct;

  it('renders the no-steps prompt and hides the library when not editable', () => {
    const { rerender } = render(
      <ApplicationFormTab
        product={product}
        schema={
          { id: 'schema-1', steps: [], document_requirements: [] } as unknown as LeadFormSchema
        }
        canManage
        isEditable
        onSchemaChange={vi.fn()}
        onSchemaRefresh={vi.fn()}
      />,
    );

    expect(screen.getByText('Add steps in the Loan Steps tab before adding fields.')).toBeTruthy();

    rerender(
      <ApplicationFormTab
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

    expect(screen.queryByText('Field library')).toBeNull();
  });

  it('shows field-library empty state and reorders fields', async () => {
    const onSchemaRefresh = vi.fn();
    updateField.mockResolvedValue({ id: 'field-1' });

    const { rerender } = render(
      <ApplicationFormTab
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

    expect(screen.getByText(/No fields yet\. Drag a type from the field library/i)).toBeTruthy();
    await userEvent.click(screen.getByText('Long text'));
    expect(screen.getByLabelText('Type')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    rerender(
      <ApplicationFormTab
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
                order: 1,
                form_fields: [
                  {
                    id: 'field-1',
                    key: 'one',
                    label: 'One',
                    field_type: 'text',
                    required: true,
                    order: 1,
                  },
                  {
                    id: 'field-2',
                    key: 'two',
                    label: 'Two',
                    field_type: 'text',
                    required: false,
                    order: 2,
                  },
                ],
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

    const one = screen.getByText('One').closest('div[draggable="true"]') ?? screen.getByText('One');
    const two = screen.getByText('Two').closest('div[draggable="true"]') ?? screen.getByText('Two');
    fireEvent.dragStart(one);
    fireEvent.dragOver(two);
    fireEvent.drop(two);

    await waitFor(() => {
      expect(updateField).toHaveBeenCalled();
      expect(onSchemaRefresh).toHaveBeenCalledWith('schema-1');
    });
  });

  it('ignores invalid field drops and surfaces reorder errors', async () => {
    const onSchemaRefresh = vi.fn();
    updateField.mockRejectedValueOnce(new ProductsApiError(400, { detail: 'reorder failed' }));

    render(
      <ApplicationFormTab
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
                order: 1,
                form_fields: [
                  {
                    id: 'field-1',
                    key: 'one',
                    label: 'One',
                    field_type: 'text',
                    required: true,
                    order: 1,
                  },
                  {
                    id: 'field-2',
                    key: 'two',
                    label: 'Two',
                    field_type: 'text',
                    required: false,
                    order: 2,
                  },
                ],
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

    const one = screen.getByText('One').closest('div[draggable="true"]') ?? screen.getByText('One');
    const two = screen.getByText('Two').closest('div[draggable="true"]') ?? screen.getByText('Two');

    fireEvent.drop(one);
    expect(updateField).not.toHaveBeenCalled();

    fireEvent.dragStart(one);
    fireEvent.drop(one);
    expect(updateField).not.toHaveBeenCalled();

    fireEvent.dragStart(two);
    fireEvent.dragOver(one);
    fireEvent.drop(one);
    await waitFor(() => {
      expect(updateField).toHaveBeenCalled();
    });
    expect(onSchemaRefresh).not.toHaveBeenCalled();
  });

  it('creates, updates, and deletes fields for a step', async () => {
    const onSchemaRefresh = vi.fn();
    createField.mockResolvedValue({ id: 'field-2' });
    updateField.mockResolvedValue({ id: 'field-1' });
    deleteField.mockResolvedValue(null);

    render(
      <ApplicationFormTab
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
                order: 1,
                form_fields: [
                  {
                    id: 'field-1',
                    key: 'applicant_name',
                    label: 'Applicant Name',
                    field_type: 'text',
                    required: true,
                    order: 1,
                  },
                ],
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

    await userEvent.click(screen.getByRole('button', { name: 'Add field' }));
    await userEvent.type(screen.getByLabelText('Key'), 'nin');
    await userEvent.type(screen.getByLabelText('Label'), 'National ID');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(createField).toHaveBeenCalledWith(
        'schema-1',
        expect.objectContaining({ key: 'nin', label: 'National ID' }),
      );
      expect(onSchemaRefresh).toHaveBeenCalledWith('schema-1');
    });

    await userEvent.click(screen.getByRole('button', { name: /Edit field Applicant Name/i }));
    await userEvent.clear(screen.getByLabelText('Label'));
    await userEvent.type(screen.getByLabelText('Label'), 'Applicant Full Name');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateField).toHaveBeenCalledWith(
        'schema-1',
        'field-1',
        expect.objectContaining({ label: 'Applicant Full Name' }),
      );
    });

    await userEvent.click(screen.getByRole('button', { name: /Delete field Applicant Name/i }));
    await waitFor(() => {
      expect(deleteField).toHaveBeenCalledWith('schema-1', 'field-1');
    });
  });

  it('renders API-shaped errors for create, update, and delete failures', async () => {
    createField.mockRejectedValueOnce(new ProductsApiError(400, { detail: 'create failed' }));
    updateField.mockRejectedValueOnce(new ProductsApiError(400, { detail: 'update failed' }));
    deleteField.mockRejectedValueOnce(new ProductsApiError(400, { detail: 'delete failed' }));

    render(
      <ApplicationFormTab
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
                order: 1,
                form_fields: [
                  {
                    id: 'field-1',
                    key: 'applicant_name',
                    label: 'Applicant Name',
                    field_type: 'text',
                    required: true,
                    order: 1,
                  },
                ],
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

    await userEvent.click(screen.getByRole('button', { name: 'Add field' }));
    await userEvent.type(screen.getByLabelText('Key'), 'bad');
    await userEvent.type(screen.getByLabelText('Label'), 'Broken Field');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('{"detail":"create failed"}');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await userEvent.click(screen.getByRole('button', { name: /Edit field Applicant Name/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('{"detail":"update failed"}');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await userEvent.click(screen.getByRole('button', { name: /Delete field Applicant Name/i }));
    await waitFor(() => {
      expect(deleteField).toHaveBeenCalledWith('schema-1', 'field-1');
    });
  });
});

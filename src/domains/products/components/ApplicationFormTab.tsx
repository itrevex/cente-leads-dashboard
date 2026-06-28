import { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, PlusCircle } from 'lucide-react';
import type { LoanProduct, LeadFormSchema, LeadFormFieldNested, FormFieldType } from '../types';
import { FIELD_TYPE_LABELS } from '../presentation';
import { createField, updateField, deleteField, ProductsApiError } from '../client';
import { computeReorder, applyReorder } from '../reorder';
import SchemaVersionBar from './SchemaVersionBar';

interface Props {
  product: LoanProduct;
  schema: LeadFormSchema | null;
  canManage: boolean;
  isEditable: boolean;
  onSchemaChange: (schema: LeadFormSchema) => void;
  onSchemaRefresh: (schemaId: string) => Promise<void>;
}

const FIELD_TYPES: FormFieldType[] = [
  'text',
  'textarea',
  'number',
  'currency',
  'date',
  'dropdown',
  'phone',
  'id',
  'file_upload',
  'signature',
];

type FieldForm = {
  step: string;
  key: string;
  label: string;
  field_type: FormFieldType;
  required: boolean;
  order: number;
};

export default function ApplicationFormTab({
  product,
  schema,
  canManage,
  isEditable,
  onSchemaChange,
  onSchemaRefresh,
}: Props) {
  const steps = schema?.steps ?? [];
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [form, setForm] = useState<FieldForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverStepId, setDragOverStepId] = useState<string | null>(null);

  function startCreate(stepId: string, fieldType: FormFieldType = 'text') {
    const step = steps.find((s) => s.id === stepId);
    setForm({
      step: stepId,
      key: '',
      label: '',
      field_type: fieldType,
      required: false,
      order: (step?.form_fields.length ?? 0) + 1,
    });
    setActiveStepId(stepId);
    setEditingId('new');
    setError(null);
  }

  async function handleFieldDrop(stepId: string, targetFieldId: string) {
    setDragOverStepId(null);
    if (!schema || !draggedFieldId || draggedFieldId === targetFieldId) {
      setDraggedFieldId(null);
      return;
    }
    const step = steps.find((s) => s.id === stepId);
    if (!step) {
      setDraggedFieldId(null);
      return;
    }
    const plan = computeReorder(step.form_fields, draggedFieldId, targetFieldId);
    setDraggedFieldId(null);
    if (plan.length === 0) return;
    setBusy(true);
    try {
      await applyReorder(plan, (id, order) => updateField(schema.id, id, { order }));
      await onSchemaRefresh(schema.id);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to reorder fields.',
      );
    } finally {
      setBusy(false);
    }
  }

  function startEdit(stepId: string, field: LeadFormFieldNested) {
    setForm({
      step: stepId,
      key: field.key,
      label: field.label,
      field_type: field.field_type,
      required: field.required,
      order: field.order,
    });
    setActiveStepId(stepId);
    setEditingId(field.id);
    setError(null);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!schema || !form) return;
    setBusy(true);
    setError(null);
    try {
      if (editingId === 'new') {
        await createField(schema.id, form);
      } else if (editingId) {
        await updateField(schema.id, editingId, form);
      }
      await onSchemaRefresh(schema.id);
      setEditingId(null);
      setForm(null);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to save field.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(fieldId: string) {
    if (!schema) return;
    setBusy(true);
    try {
      await deleteField(schema.id, fieldId);
      await onSchemaRefresh(schema.id);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to delete field.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <SchemaVersionBar
        product={product}
        schema={schema}
        canManage={canManage}
        onSchemaChange={onSchemaChange}
      />

      {schema && steps.length === 0 && (
        <p className="rounded-md border border-ink-100 bg-white px-5 py-6 text-center text-sm text-ink-400 dark:border-ink-700 dark:bg-ink-800">
          Add steps in the Loan Steps tab before adding fields.
        </p>
      )}

      {schema && steps.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStepId(step.id);
                }}
                onDragLeave={() => setDragOverStepId((cur) => (cur === step.id ? null : cur))}
                onDrop={(e) => {
                  setDragOverStepId(null);
                  if (draggedFieldId) return; // handled per-row in handleFieldDrop
                  const libraryType = e.dataTransfer.getData('text/field-type') as FormFieldType;
                  if (libraryType) startCreate(step.id, libraryType);
                }}
                className={`rounded-md border bg-white dark:bg-ink-800 ${
                  dragOverStepId === step.id && !draggedFieldId
                    ? 'border-cente-blue-400'
                    : 'border-ink-100 dark:border-ink-700'
                }`}
              >
                <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
                  <div>
                    <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">
                      {step.order}. {step.name}
                    </h3>
                    {isEditable && step.form_fields.length > 1 && (
                      <p className="text-xs text-ink-400">Drag to reorder</p>
                    )}
                  </div>
                  {isEditable && editingId === null && (
                    <button
                      onClick={() => startCreate(step.id)}
                      className="flex items-center gap-1.5 rounded-pill bg-cente-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cente-red-600"
                    >
                      <Plus size={13} /> Add field
                    </button>
                  )}
                </div>
                <div className="divide-y divide-ink-100 dark:divide-ink-700">
                  {step.form_fields.length === 0 && editingId !== 'new' && (
                    <p className="px-5 py-4 text-center text-sm text-ink-400">
                      No fields yet. Drag a type from the field library to add one.
                    </p>
                  )}
                  {[...step.form_fields]
                    .sort((a, b) => a.order - b.order)
                    .map((field) =>
                      editingId === field.id && activeStepId === step.id ? (
                        <FieldFormRow
                          key={field.id}
                          form={form!}
                          setForm={(f) => setForm(f)}
                          busy={busy}
                          error={error}
                          onSubmit={handleSubmit}
                          onCancel={() => {
                            setEditingId(null);
                            setForm(null);
                          }}
                        />
                      ) : (
                        <div
                          key={field.id}
                          draggable={isEditable && editingId === null}
                          onDragStart={() => setDraggedFieldId(field.id)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.stopPropagation();
                            handleFieldDrop(step.id, field.id);
                          }}
                          onDragEnd={() => setDraggedFieldId(null)}
                          className={`flex items-center justify-between px-5 py-3 ${
                            draggedFieldId === field.id ? 'opacity-40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isEditable && editingId === null && (
                              <GripVertical size={15} className="cursor-grab text-ink-300" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-ink-700 dark:text-ink-50">
                                {field.label}{' '}
                                {field.required && (
                                  <span className="text-xs text-cente-red-600">*</span>
                                )}
                              </p>
                              <p className="text-xs text-ink-400">
                                {field.key} · {FIELD_TYPE_LABELS[field.field_type]}
                              </p>
                            </div>
                          </div>
                          {isEditable && editingId === null && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(step.id, field)}
                                aria-label={`Edit field ${field.label}`}
                                className="text-ink-400 hover:text-ink-700"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(field.id)}
                                aria-label={`Delete field ${field.label}`}
                                className="text-ink-400 hover:text-cente-red-600"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  {editingId === 'new' && activeStepId === step.id && form && (
                    <FieldFormRow
                      form={form}
                      setForm={(f) => setForm(f)}
                      busy={busy}
                      error={error}
                      onSubmit={handleSubmit}
                      onCancel={() => {
                        setEditingId(null);
                        setForm(null);
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {isEditable && (
            <FieldTypeLibrary
              onPick={(type) => {
                const targetStepId = activeStepId ?? steps[0]?.id;
                if (targetStepId) startCreate(targetStepId, type);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FieldTypeLibrary({ onPick }: { onPick: (type: FormFieldType) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Field library
      </p>
      <div className="rounded-md border border-ink-100 bg-white p-2 dark:border-ink-700 dark:bg-ink-800">
        {FIELD_TYPES.map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/field-type', type)}
            onClick={() => onPick(type)}
            className="flex cursor-grab items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            <PlusCircle size={14} className="text-cente-blue-600" />
            {FIELD_TYPE_LABELS[type]}
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldFormRow({
  form,
  setForm,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  form: FieldForm;
  setForm: (f: FieldForm) => void;
  busy: boolean;
  error: string | null;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="field-form-key"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Key
        </label>
        <input
          id="field-form-key"
          required
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
          className="w-40 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="field-form-label"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Label
        </label>
        <input
          id="field-form-label"
          required
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="w-48 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="field-form-type"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Type
        </label>
        <select
          id="field-form-type"
          value={form.field_type}
          onChange={(e) => setForm({ ...form, field_type: e.target.value as FormFieldType })}
          className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {FIELD_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs font-medium text-ink-500 dark:text-ink-300">
        <input
          type="checkbox"
          checked={form.required}
          onChange={(e) => setForm({ ...form, required: e.target.checked })}
        />
        Required
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
        >
          Cancel
        </button>
      </div>
      {error && <p className="w-full text-xs text-cente-red-600">{error}</p>}
    </form>
  );
}

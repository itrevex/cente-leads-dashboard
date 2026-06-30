import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { LoanProduct, LeadFormSchema, LeadFormGpsRequirement } from '../types';
import {
  createGpsRequirement,
  updateGpsRequirement,
  deleteGpsRequirement,
  ProductsApiError,
} from '../client';
import SchemaVersionBar from './SchemaVersionBar';

interface Props {
  product: LoanProduct;
  schema: LeadFormSchema | null;
  canManage: boolean;
  isEditable: boolean;
  onSchemaChange: (schema: LeadFormSchema) => void;
  onSchemaRefresh: (schemaId: string) => Promise<void>;
}

type GpsForm = {
  label: string;
  required: boolean;
  order: number;
};

function blankForm(nextOrder: number): GpsForm {
  return {
    label: '',
    required: true,
    order: nextOrder,
  };
}

export default function GpsRequirementsTab({
  product,
  schema,
  canManage,
  isEditable,
  onSchemaChange,
  onSchemaRefresh,
}: Props) {
  const pins = schema?.gps_requirements ?? [];
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<GpsForm>(blankForm(1));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function startCreate() {
    setForm(blankForm(pins.length + 1));
    setEditingId('new');
    setError(null);
  }

  function startEdit(pin: LeadFormGpsRequirement) {
    setForm({
      label: pin.label,
      required: pin.required,
      order: pin.order,
    });
    setEditingId(pin.id);
    setError(null);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!schema) return;
    setBusy(true);
    setError(null);
    try {
      if (editingId === 'new') {
        await createGpsRequirement(schema.id, form);
      } else if (editingId) {
        await updateGpsRequirement(schema.id, editingId, form);
      }
      await onSchemaRefresh(schema.id);
      setEditingId(null);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to save GPS pin.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(gpsId: string) {
    if (!schema) return;
    setBusy(true);
    try {
      await deleteGpsRequirement(schema.id, gpsId);
      await onSchemaRefresh(schema.id);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to delete GPS pin.',
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

      {schema && (
        <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">
              GPS requirements
            </h3>
            {isEditable && editingId === null && (
              <button
                onClick={startCreate}
                className="flex items-center gap-1.5 rounded-pill bg-cente-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cente-red-600"
              >
                <Plus size={13} /> Add GPS pin
              </button>
            )}
          </div>

          <div className="divide-y divide-ink-100 dark:divide-ink-700">
            {pins.length === 0 && editingId !== 'new' && (
              <p className="px-5 py-6 text-center text-sm text-ink-400">No GPS requirements yet.</p>
            )}
            {pins.map((pin) =>
              editingId === pin.id ? (
                <GpsFormRow
                  key={pin.id}
                  form={form}
                  setForm={setForm}
                  busy={busy}
                  error={error}
                  onSubmit={handleSubmit}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div key={pin.id} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-50">
                    {pin.order}. {pin.label}{' '}
                    {pin.required && <span className="text-xs text-cente-red-600">*</span>}
                  </p>
                  {isEditable && editingId === null && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(pin)}
                        aria-label={`Edit GPS pin ${pin.label}`}
                        className="text-ink-400 hover:text-ink-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(pin.id)}
                        aria-label={`Delete GPS pin ${pin.label}`}
                        className="text-ink-400 hover:text-cente-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ),
            )}
            {editingId === 'new' && (
              <GpsFormRow
                form={form}
                setForm={setForm}
                busy={busy}
                error={error}
                onSubmit={handleSubmit}
                onCancel={() => setEditingId(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GpsFormRow({
  form,
  setForm,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  form: GpsForm;
  setForm: (f: GpsForm) => void;
  busy: boolean;
  error: string | null;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="gps-form-label"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Label
        </label>
        <input
          id="gps-form-label"
          required
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="w-48 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="gps-form-order"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Order
        </label>
        <input
          id="gps-form-order"
          type="number"
          required
          value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          className="w-20 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        />
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

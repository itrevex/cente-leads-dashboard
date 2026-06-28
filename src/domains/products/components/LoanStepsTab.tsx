import { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import type {
  LoanProduct,
  LeadFormSchema,
  LeadFormStep,
  StepPerformerRole,
  StepIcon,
} from '../types';
import { STEP_PERFORMER_LABELS } from '../presentation';
import { createStep, updateStep, deleteStep, ProductsApiError } from '../client';
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

const PERFORMERS: StepPerformerRole[] = [
  'branch_officer',
  'branch_manager',
  'loan_officer',
  'head_of_loans',
  'compliance_officer',
  'system_automatic',
];
const ICONS: StepIcon[] = [
  'user',
  'briefcase',
  'cash',
  'shield',
  'document',
  'check_circle',
  'clock',
  'flag',
  'home',
  'alert',
];

type StepForm = {
  name: string;
  description: string;
  performed_by: StepPerformerRole;
  sla_hours: number;
  icon: StepIcon;
  order: number;
};

function blankForm(nextOrder: number): StepForm {
  return {
    name: '',
    description: '',
    performed_by: 'branch_officer',
    sla_hours: 24,
    icon: 'user',
    order: nextOrder,
  };
}

export default function LoanStepsTab({
  product,
  schema,
  canManage,
  isEditable,
  onSchemaChange,
  onSchemaRefresh,
}: Props) {
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<StepForm>(blankForm(1));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const steps = [...(schema?.steps ?? [])].sort((a, b) => a.order - b.order);

  async function handleDrop(targetId: string) {
    if (!schema || !draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const plan = computeReorder(steps, draggedId, targetId);
    setDraggedId(null);
    if (plan.length === 0) return;
    setBusy(true);
    try {
      await applyReorder(plan, (id, order) => updateStep(schema.id, id, { order }));
      await onSchemaRefresh(schema.id);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to reorder steps.',
      );
    } finally {
      setBusy(false);
    }
  }

  function startCreate() {
    setForm(blankForm(steps.length + 1));
    setEditingId('new');
    setError(null);
  }

  function startEdit(step: LeadFormStep) {
    setForm({
      name: step.name,
      description: step.description,
      performed_by: step.performed_by,
      sla_hours: step.sla_hours,
      icon: step.icon,
      order: step.order,
    });
    setEditingId(step.id);
    setError(null);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!schema) return;
    setBusy(true);
    setError(null);
    try {
      if (editingId === 'new') {
        await createStep(schema.id, form);
      } else if (editingId) {
        await updateStep(schema.id, editingId, form);
      }
      await onSchemaRefresh(schema.id);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to save step.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(stepId: string) {
    if (!schema) return;
    setBusy(true);
    try {
      await deleteStep(schema.id, stepId);
      await onSchemaRefresh(schema.id);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to delete step.',
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
            <div>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">
                Workflow steps
              </h3>
              {isEditable && steps.length > 1 && (
                <p className="text-xs text-ink-400">Drag to reorder</p>
              )}
            </div>
            {isEditable && editingId === null && (
              <button
                onClick={startCreate}
                className="flex items-center gap-1.5 rounded-pill bg-cente-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cente-red-600"
              >
                <Plus size={13} /> Add step
              </button>
            )}
          </div>

          <div className="divide-y divide-ink-100 dark:divide-ink-700">
            {steps.length === 0 && editingId !== 'new' && (
              <p className="px-5 py-6 text-center text-sm text-ink-400">No steps yet.</p>
            )}
            {steps.map((step) =>
              editingId === step.id ? (
                <StepFormRow
                  key={step.id}
                  form={form}
                  setForm={setForm}
                  busy={busy}
                  error={error}
                  onSubmit={handleSubmit}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  key={step.id}
                  draggable={isEditable && editingId === null}
                  onDragStart={() => setDraggedId(step.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(step.id)}
                  onDragEnd={() => setDraggedId(null)}
                  className={`flex items-center justify-between px-5 py-3 ${
                    draggedId === step.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isEditable && editingId === null && (
                      <GripVertical size={15} className="cursor-grab text-ink-300" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-ink-700 dark:text-ink-50">
                        {step.order}. {step.name}
                      </p>
                      <p className="text-xs text-ink-400">
                        {STEP_PERFORMER_LABELS[step.performed_by]} · SLA {step.sla_hours}h
                      </p>
                    </div>
                  </div>
                  {isEditable && editingId === null && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(step)}
                        aria-label={`Edit step ${step.name}`}
                        className="text-ink-400 hover:text-ink-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(step.id)}
                        aria-label={`Delete step ${step.name}`}
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
              <StepFormRow
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

function StepFormRow({
  form,
  setForm,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  form: StepForm;
  setForm: (f: StepForm) => void;
  busy: boolean;
  error: string | null;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="step-form-name"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Name
        </label>
        <input
          id="step-form-name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-48 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="step-form-performed-by"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Performed by
        </label>
        <select
          id="step-form-performed-by"
          value={form.performed_by}
          onChange={(e) => setForm({ ...form, performed_by: e.target.value as StepPerformerRole })}
          className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        >
          {PERFORMERS.map((p) => (
            <option key={p} value={p}>
              {STEP_PERFORMER_LABELS[p]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="step-form-sla-hours"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          SLA (hours)
        </label>
        <input
          id="step-form-sla-hours"
          type="number"
          required
          value={form.sla_hours}
          onChange={(e) => setForm({ ...form, sla_hours: Number(e.target.value) })}
          className="w-24 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="step-form-icon"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Icon
        </label>
        <select
          id="step-form-icon"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value as StepIcon })}
          className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        >
          {ICONS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="step-form-description"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Description
        </label>
        <input
          id="step-form-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        />
      </div>
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

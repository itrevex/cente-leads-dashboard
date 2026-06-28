import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type {
  LoanProduct,
  LeadFormSchema,
  LeadFormDocumentRequirement,
  DocumentAcceptedFormat,
} from '../types';
import { DOCUMENT_FORMAT_LABELS } from '../presentation';
import {
  createDocumentRequirement,
  updateDocumentRequirement,
  deleteDocumentRequirement,
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

const FORMATS: DocumentAcceptedFormat[] = [
  'pdf_only',
  'image_jpg_png',
  'image_or_pdf',
  'pdf_or_excel',
  'any_format',
];

type DocForm = {
  name: string;
  description: string;
  accepted_format: DocumentAcceptedFormat;
  required: boolean;
  order: number;
};

function blankForm(nextOrder: number): DocForm {
  return {
    name: '',
    description: '',
    accepted_format: 'any_format',
    required: true,
    order: nextOrder,
  };
}

export default function DocumentsTab({
  product,
  schema,
  canManage,
  isEditable,
  onSchemaChange,
  onSchemaRefresh,
}: Props) {
  const docs = schema?.document_requirements ?? [];
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<DocForm>(blankForm(1));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function startCreate() {
    setForm(blankForm(docs.length + 1));
    setEditingId('new');
    setError(null);
  }

  function startEdit(doc: LeadFormDocumentRequirement) {
    setForm({
      name: doc.name,
      description: doc.description,
      accepted_format: doc.accepted_format,
      required: doc.required,
      order: doc.order,
    });
    setEditingId(doc.id);
    setError(null);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!schema) return;
    setBusy(true);
    setError(null);
    try {
      if (editingId === 'new') {
        await createDocumentRequirement(schema.id, form);
      } else if (editingId) {
        await updateDocumentRequirement(schema.id, editingId, form);
      }
      await onSchemaRefresh(schema.id);
      setEditingId(null);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to save document.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(docId: string) {
    if (!schema) return;
    setBusy(true);
    try {
      await deleteDocumentRequirement(schema.id, docId);
      await onSchemaRefresh(schema.id);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to delete document.',
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
              Document requirements
            </h3>
            {isEditable && editingId === null && (
              <button
                onClick={startCreate}
                className="flex items-center gap-1.5 rounded-pill bg-cente-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cente-red-600"
              >
                <Plus size={13} /> Add document
              </button>
            )}
          </div>

          <div className="divide-y divide-ink-100 dark:divide-ink-700">
            {docs.length === 0 && editingId !== 'new' && (
              <p className="px-5 py-6 text-center text-sm text-ink-400">
                No document requirements yet.
              </p>
            )}
            {docs.map((doc) =>
              editingId === doc.id ? (
                <DocFormRow
                  key={doc.id}
                  form={form}
                  setForm={setForm}
                  busy={busy}
                  error={error}
                  onSubmit={handleSubmit}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div key={doc.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-700 dark:text-ink-50">
                      {doc.order}. {doc.name}{' '}
                      {doc.required && <span className="text-xs text-cente-red-600">*</span>}
                    </p>
                    <p className="text-xs text-ink-400">
                      {DOCUMENT_FORMAT_LABELS[doc.accepted_format]}
                    </p>
                  </div>
                  {isEditable && editingId === null && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(doc)}
                        aria-label={`Edit document ${doc.name}`}
                        className="text-ink-400 hover:text-ink-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        aria-label={`Delete document ${doc.name}`}
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
              <DocFormRow
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

function DocFormRow({
  form,
  setForm,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  form: DocForm;
  setForm: (f: DocForm) => void;
  busy: boolean;
  error: string | null;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="document-form-name"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Name
        </label>
        <input
          id="document-form-name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-48 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="document-form-accepted-format"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Accepted format
        </label>
        <select
          id="document-form-accepted-format"
          value={form.accepted_format}
          onChange={(e) =>
            setForm({ ...form, accepted_format: e.target.value as DocumentAcceptedFormat })
          }
          className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
        >
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {DOCUMENT_FORMAT_LABELS[f]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="document-form-order"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Order
        </label>
        <input
          id="document-form-order"
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
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="document-form-description"
          className="text-xs font-medium text-ink-500 dark:text-ink-300"
        >
          Description
        </label>
        <input
          id="document-form-description"
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

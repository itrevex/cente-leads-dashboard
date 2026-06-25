import { useState } from 'react';
import type { LeadFormSchema, LoanProduct } from '../types';
import { SCHEMA_STATUS_META } from '../presentation';
import { createFormSchema, publishFormSchema, ProductsApiError } from '../client';
import Badge from '../../../shared/components/Badge';

interface Props {
  product: LoanProduct;
  schema: LeadFormSchema | null;
  canManage: boolean;
  onSchemaChange: (schema: LeadFormSchema) => void;
}

// Shown above the Loan Steps / Application Form / Documents tabs — these
// three all edit the same draft LeadFormSchema, so the version/status and
// publish/new-draft actions live in one place rather than being duplicated
// per tab (data-model §3.11: a published version's child rows are immutable;
// editing means authoring a new draft, never mutating a published one).
export default function SchemaVersionBar({ product, schema, canManage, onSchemaChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateDraft() {
    setBusy(true);
    setError(null);
    try {
      const next = await createFormSchema(product.id, schema?.version);
      onSchemaChange(next);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to create draft.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    if (!schema) return;
    setBusy(true);
    setError(null);
    try {
      const published = await publishFormSchema(schema.id);
      onSchemaChange(published);
    } catch (err) {
      setError(err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to publish.');
    } finally {
      setBusy(false);
    }
  }

  if (!schema) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-md border border-ink-100 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800">
        <p className="text-sm text-ink-500 dark:text-ink-300">
          No form schema yet for this product.
        </p>
        {canManage && (
          <button
            onClick={handleCreateDraft}
            disabled={busy}
            className="rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create draft version'}
          </button>
        )}
        {error && <p className="text-xs text-cente-red-600">{error}</p>}
      </div>
    );
  }

  const meta = SCHEMA_STATUS_META[schema.status];

  return (
    <div className="mb-4 flex items-center justify-between rounded-md border border-ink-100 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ink-700 dark:text-ink-50">
          Version {schema.version}
        </span>
        <Badge label={meta.label} color={meta.color} />
        {schema.status !== 'draft' && (
          <span className="text-xs text-ink-400">
            — editing is locked; author a new draft to change it
          </span>
        )}
      </div>
      {canManage && (
        <div className="flex items-center gap-2">
          {error && <p className="text-xs text-cente-red-600">{error}</p>}
          {schema.status === 'draft' ? (
            <button
              onClick={handlePublish}
              disabled={busy}
              className="rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:opacity-50"
            >
              {busy ? 'Publishing…' : 'Publish'}
            </button>
          ) : (
            <button
              onClick={handleCreateDraft}
              disabled={busy}
              className="rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800 disabled:opacity-50"
            >
              {busy ? 'Creating…' : 'New draft version'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

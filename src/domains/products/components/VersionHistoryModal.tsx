import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { LeadFormSchema } from '../types';
import { SCHEMA_STATUS_META } from '../presentation';
import { listFormSchemas, ProductsApiError } from '../client';
import Badge from '../../../shared/components/Badge';

interface Props {
  productId: string;
  onClose: () => void;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function VersionHistoryModal({ productId, onClose }: Props) {
  const [versions, setVersions] = useState<LeadFormSchema[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listFormSchemas(productId)
      .then((page) => {
        if (!cancelled) setVersions(page.results);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ProductsApiError
            ? JSON.stringify(err.body)
            : 'Failed to load version history.',
        );
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">Version history</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 divide-y divide-ink-100 overflow-y-auto dark:divide-ink-700">
          {error && <p className="px-5 py-4 text-sm text-cente-red-600">{error}</p>}
          {!error && versions === null && (
            <p className="px-5 py-6 text-center text-sm text-ink-400">Loading…</p>
          )}
          {versions !== null && versions.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-ink-400">No versions yet.</p>
          )}
          {versions?.map((v) => {
            const meta = SCHEMA_STATUS_META[v.status];
            return (
              <div key={v.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-50">
                    Version {v.version}
                  </p>
                  <p className="text-xs text-ink-400">
                    Created {formatDate(v.created_at)}
                    {v.published_at && ` · Published ${formatDate(v.published_at)}`}
                    {v.retired_at && ` · Retired ${formatDate(v.retired_at)}`}
                  </p>
                </div>
                <Badge label={meta.label} color={meta.color} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

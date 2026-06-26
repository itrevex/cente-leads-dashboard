import { X } from 'lucide-react';
import type { Branch } from '../types';
import { REGION_LABELS } from '../presentation';
import Badge from '../../../shared/components/Badge';

interface Props {
  branch: Branch;
  onClose: () => void;
}

export default function BranchDetailModal({ branch, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
          <div>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">{branch.name}</h3>
            <p className="mt-0.5 text-xs text-ink-400">Branch code: {branch.code}</p>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X size={16} />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-y-3 px-5 py-4 text-sm">
          <dt className="text-ink-400">Branch name</dt>
          <dd className="text-right text-ink-700 dark:text-ink-50">{branch.name}</dd>

          <dt className="text-ink-400">Branch code</dt>
          <dd className="text-right font-mono text-ink-700 dark:text-ink-50">{branch.code}</dd>

          <dt className="text-ink-400">Region</dt>
          <dd className="text-right text-ink-700 dark:text-ink-50">
            {branch.region ? REGION_LABELS[branch.region] : '—'}
          </dd>

          <dt className="text-ink-400">Applications (MTD)</dt>
          <dd className="text-right text-ink-700 dark:text-ink-50">{branch.applications_mtd}</dd>

          <dt className="text-ink-400">Officers</dt>
          <dd className="text-right text-ink-700 dark:text-ink-50">{branch.officers_count}</dd>

          <dt className="text-ink-400">Status</dt>
          <dd className="text-right">
            <Badge
              label={branch.status === 'active' ? 'Active' : 'Inactive'}
              color={branch.status === 'active' ? 'green' : 'neutral'}
            />
          </dd>
        </dl>

        <div className="flex justify-end border-t border-ink-100 px-5 py-3 dark:border-ink-700">
          <button
            onClick={onClose}
            className="rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

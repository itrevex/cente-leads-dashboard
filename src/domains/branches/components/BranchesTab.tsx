import { useState } from 'react';
import { Building2, Plus, Download } from 'lucide-react';
import type { Branch } from '../types';
import { REGION_LABELS } from '../presentation';
import Badge from '../../../shared/components/Badge';
import Pagination from '../../../shared/components/Pagination';
import BranchDetailModal from './BranchDetailModal';
import NewBranchModal from './NewBranchModal';

const PAGE_SIZE = 10;

interface Props {
  initialBranches: Branch[];
  canManage: boolean;
}

export default function BranchesTab({ initialBranches, canManage }: Props) {
  const [branches, setBranches] = useState(initialBranches.filter((b) => !b.is_hq));
  const [selected, setSelected] = useState<Branch | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(branches.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedBranches = branches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleCreated(branch: Branch) {
    setBranches((prev) => [...prev, branch]);
    setShowNew(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
            Branch Network
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            {branches.length} active Cente Leads branches · Head Office oversight
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/branches/export"
            className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            <Download size={15} /> Export
          </a>
          {canManage && (
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600"
            >
              <Plus size={15} /> Add branch
            </button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-400">
              <th className="px-5 py-2 font-medium">Branch</th>
              <th className="px-2 py-2 font-medium">Region</th>
              <th className="px-2 py-2 text-right font-medium">Officers</th>
              <th className="px-2 py-2 text-right font-medium">Apps (MTD)</th>
              <th className="px-5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-ink-400">
                  No branches found.
                </td>
              </tr>
            )}
            {pagedBranches.map((b) => (
              <tr
                key={b.id}
                onClick={() => setSelected(b)}
                className="cursor-pointer border-t border-ink-100 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-700/40"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cente-blue-100 text-cente-blue-700">
                      <Building2 size={14} />
                    </span>
                    <div>
                      <p className="font-medium text-ink-700 dark:text-ink-50">{b.name}</p>
                      <p className="font-mono text-xs text-ink-400">{b.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-sm text-ink-500 dark:text-ink-300">
                  {b.region ? REGION_LABELS[b.region] : '—'}
                </td>
                <td className="px-2 py-3 text-right text-ink-700 dark:text-ink-50">
                  {b.officers_count}
                </td>
                <td className="px-2 py-3 text-right text-ink-700 dark:text-ink-50">
                  {b.applications_mtd}
                </td>
                <td className="px-5 py-3">
                  <Badge
                    label={b.status === 'active' ? 'Active' : 'Inactive'}
                    color={b.status === 'active' ? 'green' : 'neutral'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          totalCount={branches.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {selected && <BranchDetailModal branch={selected} onClose={() => setSelected(null)} />}
      {showNew && <NewBranchModal onClose={() => setShowNew(false)} onCreated={handleCreated} />}
    </div>
  );
}

import { useState } from 'react';
import { Landmark, Plus, Download } from 'lucide-react';
import type { Cooperative, BranchOption } from '../types';
import { COOPERATIVE_TYPE_LABELS } from '../presentation';
import Badge from '../../../shared/components/Badge';
import Pagination from '../../../shared/components/Pagination';
import CooperativeFormModal from './CooperativeFormModal';

const PAGE_SIZE = 10;

interface Props {
  initialCooperatives: Cooperative[];
  branchOptions: BranchOption[];
  canManage: boolean;
}

function branchNames(coop: Cooperative, branchOptions: BranchOption[]): string {
  const names = coop.branches
    .map((id) => branchOptions.find((b) => b.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(', ') : '—';
}

export default function CooperativesTab({ initialCooperatives, branchOptions, canManage }: Props) {
  const [cooperatives, setCooperatives] = useState(initialCooperatives);
  const [editing, setEditing] = useState<Cooperative | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(cooperatives.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedCooperatives = cooperatives.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleCreated(coop: Cooperative) {
    setCooperatives((prev) => [coop, ...prev]);
    setShowNew(false);
  }

  function handleUpdated(coop: Cooperative) {
    setCooperatives((prev) => prev.map((c) => (c.id === coop.id ? coop : c)));
    setEditing(null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
            Cooperatives
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            Cooperative SACCOs and groups served by field agents. Each co-op has a chairperson who
            signs off leads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/cooperatives/export"
            className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            <Download size={15} /> Export
          </a>
          {canManage && (
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600"
            >
              <Plus size={15} /> Add cooperative
            </button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-400">
              <th className="px-5 py-2 font-medium">Cooperative</th>
              <th className="px-2 py-2 font-medium">Type</th>
              <th className="px-2 py-2 font-medium">Branches</th>
              <th className="px-5 py-2 font-medium">Status</th>
              <th className="px-5 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {cooperatives.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-ink-400">
                  No cooperatives found.
                </td>
              </tr>
            )}
            {pagedCooperatives.map((coop) => (
              <tr key={coop.id} className="border-t border-ink-100 dark:border-ink-700">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cente-blue-100 text-cente-blue-700">
                      <Landmark size={14} />
                    </span>
                    <div>
                      <p className="font-medium text-ink-700 dark:text-ink-50">{coop.name}</p>
                      <p className="font-mono text-xs text-ink-400">{coop.registration_number}</p>
                      {coop.chairperson_detail && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-300">
                          <span>{coop.chairperson_detail.full_name}</span>
                          {coop.chairperson_detail.leader_approval_status === 'pending' && (
                            <Badge label="Pending" color="yellow" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-sm text-ink-500 dark:text-ink-300">
                  {COOPERATIVE_TYPE_LABELS[coop.type] ?? coop.type}
                </td>
                <td className="px-2 py-3 text-sm text-ink-500 dark:text-ink-300">
                  {branchNames(coop, branchOptions)}
                </td>
                <td className="px-5 py-3">
                  <Badge
                    label={coop.status === 'active' ? 'Active' : 'Suspended'}
                    color={coop.status === 'active' ? 'green' : 'red'}
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {canManage && (
                      <button
                        onClick={() => setEditing(coop)}
                        className="cursor-pointer rounded-pill border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
                      >
                        Edit
                      </button>
                    )}
                    <a
                      href={`/cooperatives/${coop.id}/members`}
                      className="cursor-pointer rounded-pill border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
                    >
                      View members
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          totalCount={cooperatives.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {editing && (
        <CooperativeFormModal
          cooperative={editing}
          branchOptions={branchOptions}
          onClose={() => setEditing(null)}
          onSaved={handleUpdated}
        />
      )}
      {showNew && (
        <CooperativeFormModal
          cooperative={null}
          branchOptions={branchOptions}
          onClose={() => setShowNew(false)}
          onSaved={handleCreated}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import type { Cooperative, CooperativeMember } from '../types';
import { listCooperativeMembers, CooperativesApiError } from '../client';
import Badge from '../../../shared/components/Badge';

interface Props {
  cooperative: Cooperative;
  onClose: () => void;
}

export default function CooperativeMembersModal({ cooperative, onClose }: Props) {
  const [members, setMembers] = useState<CooperativeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listCooperativeMembers(cooperative.id)
      .then((page) => {
        if (!cancelled) setMembers(page.results);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof CooperativesApiError
              ? JSON.stringify(err.body)
              : 'Failed to load members.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cooperative.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
          <div>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">
              {cooperative.name}
            </h3>
            <p className="mt-0.5 text-xs text-ink-400">{members.length} members</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/api/cooperatives/${cooperative.id}/members/export`}
              className="flex items-center gap-1.5 rounded-pill border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
            >
              <Download size={13} /> Export
            </a>
            <button onClick={onClose} className="cursor-pointer text-ink-400 hover:text-ink-700">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {error && <p className="px-5 py-4 text-sm text-cente-red-600">{error}</p>}
          {!error && loading && (
            <p className="px-5 py-6 text-center text-sm text-ink-400">Loading members…</p>
          )}
          {!error && !loading && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-400">
                  <th className="px-5 py-2 font-medium">Member</th>
                  <th className="px-2 py-2 font-medium">NIN</th>
                  <th className="px-2 py-2 font-medium">Phone</th>
                  <th className="px-2 py-2 font-medium">Joined</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-ink-400">
                      No members found.
                    </td>
                  </tr>
                )}
                {members.map((m) => (
                  <tr key={m.id} className="border-t border-ink-100 dark:border-ink-700">
                    <td className="px-5 py-3 font-medium text-ink-700 dark:text-ink-50">
                      {m.full_name}
                    </td>
                    <td className="px-2 py-3 font-mono text-xs text-ink-400">{m.national_id}</td>
                    <td className="px-2 py-3 text-sm text-ink-500 dark:text-ink-300">{m.phone}</td>
                    <td className="px-2 py-3 text-sm text-ink-500 dark:text-ink-300">
                      {m.date_joined_cooperative}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        label={m.status === 'active' ? 'Active' : 'Inactive'}
                        color={m.status === 'active' ? 'green' : 'neutral'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end border-t border-ink-100 px-5 py-3 dark:border-ink-700">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

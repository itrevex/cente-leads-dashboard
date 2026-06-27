import { useEffect, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import type { Cooperative, CooperativeMember } from '../types';
import { listCooperativeMembers, CooperativesApiError } from '../client';
import Badge from '../../../shared/components/Badge';

interface Props {
  cooperative: Cooperative;
  initialMembers: CooperativeMember[];
}

export default function CooperativeMembersPage({ cooperative, initialMembers }: Props) {
  const [members, setMembers] = useState<CooperativeMember[]>(initialMembers);
  const [loading, setLoading] = useState(false);
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
    <div>
      <a
        href="/cooperatives"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 dark:text-ink-300 dark:hover:text-ink-50"
      >
        <ArrowLeft size={14} /> Back to Cooperatives
      </a>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
            {cooperative.name}
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{members.length} members</p>
        </div>
        <a
          href={`/api/cooperatives/${cooperative.id}/members/export`}
          className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
        >
          <Download size={15} /> Export
        </a>
      </div>

      <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
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
    </div>
  );
}

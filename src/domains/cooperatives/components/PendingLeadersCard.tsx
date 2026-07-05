import { useState } from 'react';
import { X } from 'lucide-react';
import type { PendingLeader } from '../types';
import { approveLeader, rejectLeader, CooperativesApiError } from '../client';

interface Props {
  initialLeaders: PendingLeader[];
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function PendingLeadersCard({ initialLeaders }: Props) {
  const [leaders, setLeaders] = useState(initialLeaders);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<PendingLeader | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  function removeLeader(id: string) {
    setLeaders((current) => {
      const next = current.filter((leader) => leader.id !== id);
      window.dispatchEvent(
        new CustomEvent('nav-count-changed', {
          detail: { id: 'cooperatives', count: next.length },
        }),
      );
      return next;
    });
  }

  async function approve(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await approveLeader(id);
      removeLeader(id);
    } catch (err) {
      setError(err instanceof CooperativesApiError ? JSON.stringify(err.body) : 'Approval failed.');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejecting) return;
    setBusyId(rejecting.id);
    setError(null);
    try {
      await rejectLeader(rejecting.id, reason.trim());
      removeLeader(rejecting.id);
      setRejecting(null);
      setReason('');
    } catch (err) {
      setError(
        err instanceof CooperativesApiError ? JSON.stringify(err.body) : 'Rejection failed.',
      );
    } finally {
      setBusyId(null);
    }
  }

  if (leaders.length === 0) return null;

  return (
    <>
      <section className="mb-5 rounded-md border border-cente-yellow-500/40 bg-white p-5 dark:bg-ink-800">
        <h2 className="font-semibold text-ink-700 dark:text-ink-50">Leaders awaiting approval</h2>
        <p className="mb-4 mt-1 text-sm text-ink-500">
          These leaders are active while their details are reviewed.
        </p>
        {error && <p className="mb-3 text-sm text-cente-red-600">{error}</p>}
        <div className="divide-y divide-ink-100 dark:divide-ink-700">
          {leaders.map((leader) => (
            <div key={leader.id} className="flex items-center gap-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink-700 dark:text-ink-50">{leader.full_name}</p>
                <p className="text-ink-400">
                  {leader.phone} · {leader.role === 'chairperson' ? 'Chairperson' : 'Secretary'} ·{' '}
                  {leader.cooperatives.map((coop) => coop.name).join(', ') || 'No group'}
                </p>
              </div>
              <span className="text-xs text-ink-400">
                {DATE_FORMATTER.format(new Date(leader.created_at))}
              </span>
              <button
                disabled={busyId === leader.id}
                onClick={() => approve(leader.id)}
                className="rounded-pill bg-success px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={busyId === leader.id}
                onClick={() => {
                  setRejecting(leader);
                  setReason('');
                  setError(null);
                }}
                className="rounded-pill bg-cente-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      </section>
      {rejecting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !busyId && setRejecting(null)}
        >
          <form
            onSubmit={reject}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-md bg-white dark:bg-ink-800"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
              <h3 className="font-semibold text-ink-700 dark:text-ink-50">
                Reject {rejecting.full_name}
              </h3>
              <button type="button" onClick={() => setRejecting(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm text-cente-red-700">
                The affected group will immediately lose this leader and the agent must add a
                replacement.
              </p>
              <label className="block text-xs font-medium text-ink-500">Reason (optional)</label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="min-h-24 w-full rounded-sm border border-ink-200 p-3 text-sm dark:border-ink-600 dark:bg-ink-900"
              />
              {error && <p className="text-sm text-cente-red-600">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4 dark:border-ink-700">
              <button
                type="button"
                onClick={() => setRejecting(null)}
                className="rounded-pill border border-ink-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={busyId === rejecting.id}
                className="rounded-pill bg-cente-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Reject leader
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

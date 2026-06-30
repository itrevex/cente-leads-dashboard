import { useEffect, useState } from 'react';
import { UserCog, X } from 'lucide-react';
import {
  getReassignCandidates,
  reassignLead,
  LeadsApiError,
  type ReassignCandidate,
} from '../client';

interface Props {
  leadId: string;
  assignedAgentId: string | null;
  reviewingOfficerId: string | null;
}

export default function ReassignLead({ leadId, assignedAgentId, reviewingOfficerId }: Props) {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<ReassignCandidate[]>([]);
  const [officers, setOfficers] = useState<ReassignCandidate[]>([]);
  const [agentId, setAgentId] = useState(assignedAgentId ?? '');
  const [officerId, setOfficerId] = useState(reviewingOfficerId ?? '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    getReassignCandidates()
      .then(({ agents, reviewing_officers }) => {
        setAgents(agents);
        setOfficers(reviewing_officers);
      })
      .catch(() => setError('Failed to load agents and officers.'))
      .finally(() => setLoading(false));
  }, [open]);

  function openModal() {
    setAgentId(assignedAgentId ?? '');
    setOfficerId(reviewingOfficerId ?? '');
    setError(null);
    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
  }

  const agentChanged = agentId !== (assignedAgentId ?? '');
  const officerChanged = officerId !== (reviewingOfficerId ?? '');
  const valid = agentChanged || officerChanged;

  async function handleConfirm(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!valid) return;

    setSaving(true);
    setError(null);
    try {
      await reassignLead(leadId, {
        ...(agentChanged ? { agent_id: agentId } : {}),
        ...(officerChanged ? { reviewing_officer_id: officerId } : {}),
      });
      window.location.reload();
    } catch (err) {
      setError(err instanceof LeadsApiError ? JSON.stringify(err.body) : 'Failed to reassign.');
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        title="Reassign"
        aria-label="Reassign"
        className="flex cursor-pointer items-center gap-1.5 rounded-pill border border-ink-200 px-3 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
      >
        <UserCog size={15} />
        Reassign
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <form
            onSubmit={handleConfirm}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">Reassign lead</h3>
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer text-ink-400 hover:text-ink-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 px-5 py-4">
              {loading ? (
                <p className="text-sm text-ink-400">Loading agents and officers…</p>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
                    Assigned agent
                    <select
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                      className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
                    >
                      <option value="">— Unassigned —</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.full_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
                    Reviewing officer
                    <select
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
                    >
                      <option value="">— Unassigned —</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.full_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {error && <p className="text-xs text-cente-red-600">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3 dark:border-ink-700">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!valid || saving || loading}
                className="cursor-pointer rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Confirm Reassign'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

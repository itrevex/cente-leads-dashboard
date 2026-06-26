import { useState } from 'react';
import { X } from 'lucide-react';
import type { Agent, BranchOption } from '../types';
import { updateAgent, AgentsApiError } from '../client';

interface Props {
  agent: Agent;
  branchOptions: BranchOption[];
  onClose: () => void;
  onSaved: (agent: Agent) => void;
}

export default function EditAgentModal({ agent, branchOptions, onClose, onSaved }: Props) {
  const [fullName, setFullName] = useState(agent.full_name);
  const [phone, setPhone] = useState(agent.phone);
  const [status, setStatus] = useState(agent.status);
  const [branchIds, setBranchIds] = useState<string[]>(agent.branches.map((b) => b.id));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const valid = fullName.trim() && phone.trim() && branchIds.length > 0;

  function toggleBranch(id: string) {
    setBranchIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAgent(agent.id, {
        full_name: fullName,
        phone,
        status,
        branch_ids: branchIds,
      });
      onSaved(updated);
    } catch (err) {
      setError(
        err instanceof AgentsApiError ? JSON.stringify(err.body) : 'Failed to update agent.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
          <div>
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">Edit agent</h3>
            <p className="mt-0.5 text-xs text-ink-400">{agent.full_name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-ink-400 hover:text-ink-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Full name
              <input
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Phone number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Agent['status'])}
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              >
                <option value="active">Active</option>
                <option value="disabled">Suspended</option>
              </select>
            </label>
          </div>

          <div className="mt-3 flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
            Assigned branches <span className="text-ink-400">(select one or more)</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {branchOptions.map((b) => (
                <label
                  key={b.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-1.5 text-sm font-normal ${
                    branchIds.includes(b.id)
                      ? 'border-cente-blue-600 bg-cente-blue-50 text-cente-blue-700 dark:bg-cente-blue-700/20 dark:text-cente-blue-300'
                      : 'border-ink-200 text-ink-600 dark:border-ink-600 dark:text-ink-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={branchIds.includes(b.id)}
                    onChange={() => toggleBranch(b.id)}
                    className="accent-cente-blue-600"
                  />
                  {b.name}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-cente-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3 dark:border-ink-700">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!valid || saving}
            className="cursor-pointer rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

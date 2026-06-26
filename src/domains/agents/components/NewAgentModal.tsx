import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { BranchOption, CooperativeOption, Agent } from '../types';
import { createAgent, AgentsApiError } from '../client';

interface Props {
  branchOptions: BranchOption[];
  cooperativeOptions: CooperativeOption[];
  onClose: () => void;
  onCreated: (agent: Agent) => void;
}

type CooperativeMode = 'existing' | 'new';

export default function NewAgentModal({
  branchOptions,
  cooperativeOptions,
  onClose,
  onCreated,
}: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [coopMode, setCoopMode] = useState<CooperativeMode>('existing');
  const [cooperativeId, setCooperativeId] = useState('');
  const [newCooperativeName, setNewCooperativeName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const coopValid =
    coopMode === 'existing' ? Boolean(cooperativeId) : Boolean(newCooperativeName.trim());
  const valid = fullName.trim() && phone.trim() && branchIds.length > 0 && coopValid;

  function toggleBranch(id: string) {
    setBranchIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const agent = await createAgent({
        full_name: fullName,
        phone,
        email: email || undefined,
        branch_ids: branchIds,
        ...(coopMode === 'existing'
          ? { cooperative_id: cooperativeId }
          : { new_cooperative_name: newCooperativeName }),
      });
      onCreated(agent);
    } catch (err) {
      setError(err instanceof AgentsApiError ? JSON.stringify(err.body) : 'Failed to add agent.');
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
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">Add field agent</h3>
            <p className="mt-0.5 text-xs text-ink-400">
              The agent will cover the cooperative and branches selected below.
            </p>
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
                placeholder="e.g. Akello Sarah"
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Phone number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 7XX XXX XXX"
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Email (optional)
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@example.com"
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
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

          <div className="mt-3 flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
            Cooperative
            <div className="flex gap-3 pt-1 text-sm font-normal text-ink-600 dark:text-ink-300">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  checked={coopMode === 'existing'}
                  onChange={() => setCoopMode('existing')}
                  className="accent-cente-blue-600"
                />
                Cover an existing cooperative
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  checked={coopMode === 'new'}
                  onChange={() => setCoopMode('new')}
                  className="accent-cente-blue-600"
                />
                Create a new cooperative
              </label>
            </div>
            {coopMode === 'existing' ? (
              <select
                value={cooperativeId}
                onChange={(e) => setCooperativeId(e.target.value)}
                className="mt-2 rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              >
                <option value="">Select a cooperative…</option>
                {cooperativeOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={newCooperativeName}
                onChange={(e) => setNewCooperativeName(e.target.value)}
                placeholder="e.g. Kiryandongo Growers SACCO"
                className="mt-2 rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            )}
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
            className="flex cursor-pointer items-center gap-2 rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus size={15} /> {saving ? 'Adding…' : 'Add agent'}
          </button>
        </div>
      </form>
    </div>
  );
}

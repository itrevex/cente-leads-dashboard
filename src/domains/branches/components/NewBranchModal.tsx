import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Branch } from '../types';
import { BRANCH_REGIONS, REGION_LABELS } from '../presentation';
import { createBranch, BranchesApiError } from '../client';

interface Props {
  onClose: () => void;
  onCreated: (branch: Branch) => void;
}

const emptyForm = {
  name: '',
  code: '',
  region: 'central' as const,
  district: '',
  phone: '',
};

export default function NewBranchModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const valid = form.name.trim() && form.code.trim() && form.district.trim();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const branch = await createBranch({
        name: form.name,
        code: form.code,
        region: form.region,
        district: form.district,
        phone: form.phone,
      });
      onCreated(branch);
    } catch (err) {
      setError(
        err instanceof BranchesApiError ? JSON.stringify(err.body) : 'Failed to create branch.',
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
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">Add branch</h3>
            <p className="mt-0.5 text-xs text-ink-400">
              Enter the basic branch information to register it on the network.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
            Branch name
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lira Branch"
              className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
            Branch code
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().slice(0, 4) })}
              placeholder="e.g. LRA"
              className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-mono font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
            Region
            <select
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value as typeof form.region })}
              className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
            >
              {BRANCH_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {REGION_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
            District / town
            <input
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              placeholder="e.g. Lira"
              className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
            Branch phone (optional)
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+256…"
              className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
            />
          </label>
          {error && <p className="col-span-2 text-xs text-cente-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3 dark:border-ink-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!valid || saving}
            className="flex items-center gap-2 rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:opacity-50"
          >
            <Plus size={15} /> {saving ? 'Adding…' : 'Add branch'}
          </button>
        </div>
      </form>
    </div>
  );
}

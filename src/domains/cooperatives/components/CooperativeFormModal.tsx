import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Cooperative, BranchOption } from '../types';
import { COOPERATIVE_TYPES, COOPERATIVE_TYPE_LABELS } from '../presentation';
import { createCooperative, updateCooperative, CooperativesApiError } from '../client';

interface Props {
  cooperative: Cooperative | null;
  branchOptions: BranchOption[];
  onClose: () => void;
  onSaved: (cooperative: Cooperative) => void;
}

export default function CooperativeFormModal({
  cooperative,
  branchOptions,
  onClose,
  onSaved,
}: Props) {
  const isEdit = cooperative !== null;
  const [name, setName] = useState(cooperative?.name ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(
    cooperative?.registration_number ?? '',
  );
  const [type, setType] = useState(cooperative?.type ?? 'cooperative');
  const [district, setDistrict] = useState(cooperative?.district ?? '');
  const [branchIds, setBranchIds] = useState<string[]>(cooperative?.branches ?? []);
  const [contactPhone, setContactPhone] = useState(cooperative?.contact_phone ?? '');
  const [contactEmail, setContactEmail] = useState(cooperative?.contact_email ?? '');
  const [status, setStatus] = useState(cooperative?.status ?? 'active');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const valid =
    name.trim() && registrationNumber.trim() && contactPhone.trim() && branchIds.length > 0;

  function toggleBranch(id: string) {
    setBranchIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        registration_number: registrationNumber,
        type,
        district,
        branches: branchIds,
        contact_phone: contactPhone,
        contact_email: contactEmail || undefined,
      };
      const saved =
        isEdit && cooperative
          ? await updateCooperative(cooperative.id, { ...payload, status })
          : await createCooperative(payload);
      onSaved(saved);
    } catch (err) {
      setError(
        err instanceof CooperativesApiError
          ? JSON.stringify(err.body)
          : 'Failed to save cooperative.',
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
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">
              {isEdit ? 'Edit cooperative' : 'Add cooperative'}
            </h3>
            <p className="mt-0.5 text-xs text-ink-400">
              {isEdit ? cooperative?.name : 'Register a SACCO or group served by field agents.'}
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
            <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Cooperative name
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kiryandongo Growers SACCO"
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Registration number
              <input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. REG-2024-0012"
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-mono font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Cooperative['type'])}
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              >
                {COOPERATIVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {COOPERATIVE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              District / town
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Kiryandongo"
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Contact phone
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+256 7XX XXX XXX"
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
              Contact email (optional)
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="coop@example.com"
                className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
              />
            </label>
            {isEdit && (
              <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Cooperative['status'])}
                  className="rounded-sm border border-ink-200 px-3 py-2 text-sm font-normal text-ink-700 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-50"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-1 text-xs font-medium text-ink-500 dark:text-ink-300">
            Served by branches <span className="text-ink-400">(select one or more)</span>
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

          {isEdit && (
            <p className="mt-3 text-xs text-ink-400">
              Chairperson: {cooperative?.chairperson ? 'Assigned' : 'Not yet assigned'} · Secretary:{' '}
              {cooperative?.secretary ? 'Assigned' : 'Not yet assigned'}
            </p>
          )}

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
            <Plus size={15} /> {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add cooperative'}
          </button>
        </div>
      </form>
    </div>
  );
}

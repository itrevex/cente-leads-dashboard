import { useState } from 'react';
import type { LoanProduct, LoanProductSegment, BranchOption } from '../types';
import { SEGMENT_LABELS } from '../presentation';
import { updateProduct, ProductsApiError } from '../client';

interface Props {
  product: LoanProduct;
  branchOptions: BranchOption[];
  canManage: boolean;
  onSaved: (product: LoanProduct) => void;
}

const SEGMENTS: LoanProductSegment[] = ['salary', 'business', 'agriculture', 'asset_finance'];

export default function SettingsTab({ product, branchOptions, canManage, onSaved }: Props) {
  const [form, setForm] = useState({
    name: product.name,
    code: product.code,
    segment: product.segment,
    description: product.description,
    min_amount: product.min_amount / 100,
    max_amount: product.max_amount / 100,
    interest_rate_bps: product.interest_rate_bps,
    processing_fee_bps: product.processing_fee_bps,
    min_term_months: product.min_term_months,
    max_term_months: product.max_term_months,
    requires_chair_approval: product.requires_chair_approval,
    is_active: product.is_active,
  });
  const [branches, setBranches] = useState<string[]>(product.branch_availability);
  const [branchFilter, setBranchFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProduct(product.id, {
        ...form,
        min_amount: Math.round(form.min_amount * 100),
        max_amount: Math.round(form.max_amount * 100),
        branch_availability: branches,
      });
      onSaved(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  function toggleBranch(id: string) {
    setBranches((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

  const filteredBranches = branchOptions.filter((b) =>
    b.name.toLowerCase().includes(branchFilter.trim().toLowerCase()),
  );

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col gap-6 rounded-md border border-ink-100 bg-white p-6 dark:border-ink-700 dark:bg-ink-800"
    >
      <fieldset disabled={!canManage} className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="product-settings-name"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Name
          </label>
          <input
            id="product-settings-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="product-settings-code"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Code
          </label>
          <input
            id="product-settings-code"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="product-settings-segment"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Segment
          </label>
          <select
            id="product-settings-segment"
            value={form.segment}
            onChange={(e) => setForm({ ...form, segment: e.target.value as LoanProductSegment })}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          >
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {SEGMENT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2 text-xs font-medium text-ink-500 dark:text-ink-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Product active
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs font-medium text-ink-500 dark:text-ink-300">
            <input
              type="checkbox"
              checked={form.requires_chair_approval}
              onChange={(e) => setForm({ ...form, requires_chair_approval: e.target.checked })}
            />
            Requires chair approval
          </label>
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <label
            htmlFor="product-settings-description"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Description
          </label>
          <textarea
            id="product-settings-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="product-settings-min-amount"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Min amount (UGX)
          </label>
          <input
            id="product-settings-min-amount"
            type="number"
            required
            value={form.min_amount}
            onChange={(e) => setForm({ ...form, min_amount: Number(e.target.value) })}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="product-settings-max-amount"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Max amount (UGX)
          </label>
          <input
            id="product-settings-max-amount"
            type="number"
            required
            value={form.max_amount}
            onChange={(e) => setForm({ ...form, max_amount: Number(e.target.value) })}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="product-settings-min-term"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Min term (months)
          </label>
          <input
            id="product-settings-min-term"
            type="number"
            required
            value={form.min_term_months}
            onChange={(e) => setForm({ ...form, min_term_months: Number(e.target.value) })}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="product-settings-max-term"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Max term (months)
          </label>
          <input
            id="product-settings-max-term"
            type="number"
            required
            value={form.max_term_months}
            onChange={(e) => setForm({ ...form, max_term_months: Number(e.target.value) })}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="product-settings-interest-rate"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Interest rate (bps)
          </label>
          <input
            id="product-settings-interest-rate"
            type="number"
            required
            value={form.interest_rate_bps}
            onChange={(e) => setForm({ ...form, interest_rate_bps: Number(e.target.value) })}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="product-settings-processing-fee"
            className="text-xs font-medium text-ink-500 dark:text-ink-300"
          >
            Processing fee (bps)
          </label>
          <input
            id="product-settings-processing-fee"
            type="number"
            required
            value={form.processing_fee_bps}
            onChange={(e) => setForm({ ...form, processing_fee_bps: Number(e.target.value) })}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        </div>
      </fieldset>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">
            Available branches
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-400">
              {branches.length} of {branchOptions.length} selected
            </span>
            {canManage && branchOptions.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setBranches(
                    branches.length === branchOptions.length ? [] : branchOptions.map((b) => b.id),
                  )
                }
                className="text-xs font-medium text-cente-blue-600 hover:underline dark:text-cente-blue-300"
              >
                {branches.length === branchOptions.length ? 'Clear all' : 'Select all'}
              </button>
            )}
          </div>
        </div>
        {branchOptions.length > 8 && (
          <input
            type="text"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            placeholder="Search branches…"
            disabled={!canManage}
            className="mb-2 w-full rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          />
        )}
        <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto rounded-md border border-ink-100 p-3 dark:border-ink-700">
          {filteredBranches.map((b) => {
            const active = branches.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                disabled={!canManage}
                onClick={() => toggleBranch(b.id)}
                className={`rounded-pill border px-3 py-1.5 text-xs font-medium ${
                  active
                    ? 'border-cente-blue-600 bg-cente-blue-600 text-white'
                    : 'border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40'
                }`}
              >
                {b.name}
              </button>
            );
          })}
          {branchOptions.length === 0 && (
            <p className="text-xs text-ink-400">No branches available.</p>
          )}
          {branchOptions.length > 0 && filteredBranches.length === 0 && (
            <p className="text-xs text-ink-400">No branches match "{branchFilter}".</p>
          )}
        </div>
      </div>

      {canManage && (
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {savedAt && <span className="text-xs text-success">Saved</span>}
          {error && <span className="text-xs text-cente-red-600">{error}</span>}
        </div>
      )}
    </form>
  );
}

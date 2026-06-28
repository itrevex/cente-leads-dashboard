import { useState } from 'react';
import { Plus, Package, Copy } from 'lucide-react';
import type { LoanProduct, LoanProductSegment } from '../types';
import { SEGMENT_LABELS, formatUgx, formatBps } from '../presentation';
import { createProduct, duplicateProduct, ProductsApiError } from '../client';
import Badge from '../../../shared/components/Badge';

interface Props {
  initialProducts: LoanProduct[];
  canManage: boolean;
}

const SEGMENTS: LoanProductSegment[] = ['salary', 'business', 'agriculture', 'asset_finance'];

const emptyForm = {
  code: '',
  name: '',
  segment: 'business' as LoanProductSegment,
  min_amount: 0,
  max_amount: 0,
  interest_rate_bps: 0,
  min_term_months: 1,
  max_term_months: 12,
};

export default function ProductsListPage({ initialProducts, canManage }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);

  async function handleDuplicate() {
    if (!selectedId) return;
    setDuplicating(true);
    setError(null);
    try {
      const copy = await duplicateProduct(selectedId);
      setProducts((prev) => [...prev, copy]);
      setSelectedId(copy.id);
    } catch (err) {
      setError(
        err instanceof ProductsApiError ? JSON.stringify(err.body) : 'Failed to duplicate product.',
      );
    } finally {
      setDuplicating(false);
    }
  }

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const product = await createProduct({
        ...form,
        min_amount: Math.round(form.min_amount * 100),
        max_amount: Math.round(form.max_amount * 100),
        currency: 'UGX',
      });
      setProducts((prev) => [...prev, product]);
      setShowForm(false);
      setForm(emptyForm);
    } catch (err) {
      if (err instanceof ProductsApiError) {
        setError(JSON.stringify(err.body));
      } else {
        setError('Something went wrong creating the product.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
            Loan Products
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
            {products.length} product{products.length === 1 ? '' : 's'} configured
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicate}
              disabled={!selectedId || duplicating}
              className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
            >
              <Copy size={15} /> {duplicating ? 'Duplicating…' : 'Duplicate'}
            </button>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600"
            >
              <Plus size={15} /> New Product
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-800"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="product-create-code"
              className="text-xs font-medium text-ink-500 dark:text-ink-300"
            >
              Code
            </label>
            <input
              id="product-create-code"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-32 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="product-create-name"
              className="text-xs font-medium text-ink-500 dark:text-ink-300"
            >
              Name
            </label>
            <input
              id="product-create-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-48 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="product-create-segment"
              className="text-xs font-medium text-ink-500 dark:text-ink-300"
            >
              Segment
            </label>
            <select
              id="product-create-segment"
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
            <label
              htmlFor="product-create-min-amount"
              className="text-xs font-medium text-ink-500 dark:text-ink-300"
            >
              Min amount (UGX)
            </label>
            <input
              id="product-create-min-amount"
              type="number"
              required
              value={form.min_amount}
              onChange={(e) => setForm({ ...form, min_amount: Number(e.target.value) })}
              className="w-32 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="product-create-max-amount"
              className="text-xs font-medium text-ink-500 dark:text-ink-300"
            >
              Max amount (UGX)
            </label>
            <input
              id="product-create-max-amount"
              type="number"
              required
              value={form.max_amount}
              onChange={(e) => setForm({ ...form, max_amount: Number(e.target.value) })}
              className="w-32 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="product-create-interest-rate"
              className="text-xs font-medium text-ink-500 dark:text-ink-300"
            >
              Interest rate (bps)
            </label>
            <input
              id="product-create-interest-rate"
              type="number"
              required
              value={form.interest_rate_bps}
              onChange={(e) => setForm({ ...form, interest_rate_bps: Number(e.target.value) })}
              className="w-28 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="product-create-min-term"
              className="text-xs font-medium text-ink-500 dark:text-ink-300"
            >
              Min term (mo)
            </label>
            <input
              id="product-create-min-term"
              type="number"
              required
              value={form.min_term_months}
              onChange={(e) => setForm({ ...form, min_term_months: Number(e.target.value) })}
              className="w-24 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="product-create-max-term"
              className="text-xs font-medium text-ink-500 dark:text-ink-300"
            >
              Max term (mo)
            </label>
            <input
              id="product-create-max-term"
              type="number"
              required
              value={form.max_term_months}
              onChange={(e) => setForm({ ...form, max_term_months: Number(e.target.value) })}
              className="w-24 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-pill border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
            >
              Cancel
            </button>
          </div>
          {error && <p className="w-full text-xs text-cente-red-600">{error}</p>}
        </form>
      )}

      <div className="rounded-md border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-400">
              <th className="w-8 px-5 py-2 font-medium"></th>
              <th className="px-2 py-2 font-medium">Name</th>
              <th className="px-2 py-2 font-medium">Code</th>
              <th className="px-2 py-2 font-medium">Segment</th>
              <th className="px-2 py-2 font-medium">Amount range</th>
              <th className="px-2 py-2 font-medium">Rate</th>
              <th className="px-2 py-2 font-medium">Tenor</th>
              <th className="px-2 py-2 font-medium">Branches</th>
              <th className="px-2 py-2 text-right font-medium">Applications (MTD)</th>
              <th className="px-2 py-2 text-right font-medium">Approval rate</th>
              <th className="px-5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={11} className="px-5 py-6 text-center text-ink-400">
                  No loan products yet.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`cursor-pointer border-t border-ink-100 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-700/40 ${
                  selectedId === p.id ? 'bg-cente-blue-50 dark:bg-ink-700/40' : ''
                }`}
              >
                <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="radio"
                    checked={selectedId === p.id}
                    onChange={() => setSelectedId(p.id)}
                    className="accent-cente-blue-600"
                  />
                </td>
                <td
                  className="px-2 py-3"
                  onClick={() => (window.location.href = `/products/${p.id}`)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cente-blue-100 text-cente-blue-700">
                      <Package size={14} />
                    </span>
                    <p className="font-medium text-ink-700 dark:text-ink-50">{p.name}</p>
                  </div>
                </td>
                <td className="px-2 py-3 font-mono text-xs text-ink-500 dark:text-ink-300">
                  {p.code}
                </td>
                <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                  {SEGMENT_LABELS[p.segment]}
                </td>
                <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                  {formatUgx(p.min_amount)} – {formatUgx(p.max_amount)}
                </td>
                <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                  {formatBps(p.interest_rate_bps)}
                </td>
                <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                  {p.min_term_months}–{p.max_term_months} mo
                </td>
                <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                  {p.branch_availability.length}
                </td>
                <td className="px-2 py-3 text-right font-medium text-ink-700 dark:text-ink-50">
                  {p.applications_mtd.toLocaleString()}
                </td>
                <td className="px-2 py-3 text-right text-ink-500 dark:text-ink-300">
                  {p.approval_rate === null ? '—' : `${p.approval_rate}%`}
                </td>
                <td className="px-5 py-3">
                  <Badge
                    label={p.is_active ? 'Active' : 'Inactive'}
                    color={p.is_active ? 'green' : 'neutral'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, UserRound, Download } from 'lucide-react';
import type { DashboardUser, Role, BranchOption } from '../types';
import type { DashboardRole } from '../../../shared/types';
import { ROLE_LABELS, formatLastActivity } from '../presentation';
import { createUser, updateUser, suspendUser, reactivateUser, UsersApiError } from '../client';
import Badge from '../../../shared/components/Badge';
import Pagination from '../../../shared/components/Pagination';

const PAGE_SIZE = 10;

interface Props {
  initialUsers: DashboardUser[];
  roles: Role[];
  branchOptions: BranchOption[];
  canManage: boolean;
}

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  role: '',
  branch: '',
  password: '',
};

export default function UsersTab({ initialUsers, roles, branchOptions, canManage }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filteredUsers = users.filter(
    (u) => (!roleFilter || u.role === roleFilter) && (!branchFilter || u.branch === branchFilter),
  );
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  }

  function startEdit(user: DashboardUser) {
    setForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      branch: user.branch ?? '',
      password: '',
    });
    setEditingId(user.id);
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        role: form.role as DashboardRole,
        branch: form.branch || null,
        ...(form.password ? { password: form.password } : {}),
      };
      if (editingId) {
        const updated = await updateUser(editingId, payload);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      } else {
        const created = await createUser(payload);
        setUsers((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof UsersApiError ? JSON.stringify(err.body) : 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(user: DashboardUser) {
    setBusyId(user.id);
    try {
      const updated =
        user.status === 'active' ? await suspendUser(user.id) : await reactivateUser(user.id);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(
        err instanceof UsersApiError ? JSON.stringify(err.body) : 'Failed to update status.',
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          >
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {ROLE_LABELS[r.key as keyof typeof ROLE_LABELS] ?? r.name}
              </option>
            ))}
          </select>
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
          >
            <option value="">All branches</option>
            {branchOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-ink-400">
            {filteredUsers.length} of {users.length} users
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/users/export"
            className="flex items-center gap-2 rounded-pill border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
          >
            <Download size={15} /> Export
          </a>
          {canManage && (
            <button
              onClick={startCreate}
              className="flex items-center gap-2 rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600"
            >
              <Plus size={15} /> New User
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-800"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500 dark:text-ink-300">Full name</label>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-48 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500 dark:text-ink-300">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-56 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500 dark:text-ink-300">Phone</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-40 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500 dark:text-ink-300">Role</label>
            <select
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            >
              <option value="" disabled>
                Select role
              </option>
              {roles.map((r) => (
                <option key={r.key} value={r.key}>
                  {ROLE_LABELS[r.key as keyof typeof ROLE_LABELS] ?? r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500 dark:text-ink-300">Branch</label>
            <select
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className="rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            >
              <option value="">No branch</option>
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500 dark:text-ink-300">
              {editingId ? 'New password (optional)' : 'Password (optional)'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-40 rounded-sm border border-ink-200 px-3 py-2 text-sm dark:border-ink-600 dark:bg-ink-900"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save' : 'Create'}
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
              <th className="px-5 py-2 font-medium">Name</th>
              <th className="px-2 py-2 font-medium">Role</th>
              <th className="px-2 py-2 font-medium">Branch</th>
              <th className="px-2 py-2 font-medium">Contact</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Last activity</th>
              {canManage && <th className="px-5 py-2 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-ink-400">
                  No users found.
                </td>
              </tr>
            )}
            {pagedUsers.map((u) => (
              <tr
                key={u.id}
                className="border-t border-ink-100 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-700/40"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cente-blue-100 text-cente-blue-700">
                      <UserRound size={14} />
                    </span>
                    <p className="font-medium text-ink-700 dark:text-ink-50">{u.full_name}</p>
                  </div>
                </td>
                <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                  {ROLE_LABELS[u.role] ?? u.role}
                </td>
                <td className="px-2 py-3 text-ink-500 dark:text-ink-300">{u.branch_name ?? '—'}</td>
                <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                  <p>{u.email}</p>
                  <p className="text-xs text-ink-400">{u.phone}</p>
                </td>
                <td className="px-2 py-3">
                  <Badge
                    label={u.status === 'active' ? 'Active' : 'Disabled'}
                    color={u.status === 'active' ? 'green' : 'neutral'}
                  />
                </td>
                <td className="px-2 py-3 text-ink-500 dark:text-ink-300">
                  {formatLastActivity(u.last_active_at)}
                </td>
                {canManage && (
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(u)}
                        className="text-xs font-medium text-cente-blue-600 hover:underline dark:text-cente-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={busyId === u.id}
                        className="text-xs font-medium text-cente-red-600 hover:underline disabled:opacity-50"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          totalCount={filteredUsers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

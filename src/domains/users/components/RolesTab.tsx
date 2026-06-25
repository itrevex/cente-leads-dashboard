import { useState } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import type { Role, DashboardPermission } from '../types';
import { createRole, updateRolePermissions, UsersApiError } from '../client';
import Badge from '../../../shared/components/Badge';

interface Props {
  initialRoles: Role[];
  permissions: DashboardPermission[];
  canManage: boolean;
}

export default function RolesTab({ initialRoles, permissions, canManage }: Props) {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedId, setSelectedId] = useState<string | null>(initialRoles[0]?.id ?? null);
  const [grantedKeys, setGrantedKeys] = useState<string[]>(
    initialRoles[0]?.permissions.map((p) => p.key) ?? [],
  );
  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ key: '', name: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const selectedRole = roles.find((r) => r.id === selectedId) ?? null;

  function selectRole(role: Role) {
    setSelectedId(role.id);
    setGrantedKeys(role.permissions.map((p) => p.key));
    setSavedAt(null);
    setError(null);
  }

  function togglePermission(key: string) {
    setGrantedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleSavePermissions() {
    if (!selectedRole) return;
    setSaving(true);
    setError(null);
    try {
      const updatedGrants = await updateRolePermissions(selectedRole.id, grantedKeys);
      setRoles((prev) =>
        prev.map((r) => (r.id === selectedRole.id ? { ...r, permissions: updatedGrants } : r)),
      );
      setSavedAt(Date.now());
    } catch (err) {
      setError(
        err instanceof UsersApiError ? JSON.stringify(err.body) : 'Failed to save permissions.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateRole(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const role = await createRole(newRole);
      setRoles((prev) => [...prev, role]);
      setShowCreate(false);
      setNewRole({ key: '', name: '', description: '' });
      selectRole(role);
    } catch (err) {
      setError(err instanceof UsersApiError ? JSON.stringify(err.body) : 'Failed to create role.');
    } finally {
      setSaving(false);
    }
  }

  const dirty =
    selectedRole !== null &&
    JSON.stringify([...grantedKeys].sort()) !==
      JSON.stringify(selectedRole.permissions.map((p) => p.key).sort());

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">Roles</h3>
          {canManage && (
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-cente-blue-600 hover:underline dark:text-cente-blue-300"
            >
              <Plus size={13} /> New role
            </button>
          )}
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreateRole}
            className="mb-3 flex flex-col gap-2 rounded-md border border-ink-100 bg-white p-3 dark:border-ink-700 dark:bg-ink-800"
          >
            <input
              required
              placeholder="Key (e.g. risk_analyst)"
              value={newRole.key}
              onChange={(e) => setNewRole({ ...newRole, key: e.target.value })}
              className="rounded-sm border border-ink-200 px-2.5 py-1.5 text-xs dark:border-ink-600 dark:bg-ink-900"
            />
            <input
              required
              placeholder="Name"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              className="rounded-sm border border-ink-200 px-2.5 py-1.5 text-xs dark:border-ink-600 dark:bg-ink-900"
            />
            <input
              placeholder="Description (optional)"
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              className="rounded-sm border border-ink-200 px-2.5 py-1.5 text-xs dark:border-ink-600 dark:bg-ink-900"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-pill bg-cente-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cente-red-600 disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-pill border border-ink-200 px-3 py-1.5 text-xs text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-1 rounded-md border border-ink-100 bg-white p-2 dark:border-ink-700 dark:bg-ink-800">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => selectRole(role)}
              className={`flex items-center justify-between rounded-sm px-3 py-2 text-left text-sm ${
                selectedId === role.id
                  ? 'bg-cente-blue-50 font-medium text-cente-blue-600 dark:bg-ink-700/60 dark:text-cente-blue-300'
                  : 'text-ink-600 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-700/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} />
                {role.name}
              </span>
              {role.is_builtin && <Badge label="Built-in" color="neutral" />}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
        {!selectedRole ? (
          <p className="text-sm text-ink-400">Select a role to manage its permissions.</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-50">
                  {selectedRole.name}
                </h3>
                {selectedRole.description && (
                  <p className="text-xs text-ink-400">{selectedRole.description}</p>
                )}
              </div>
              {canManage && (
                <button
                  onClick={handleSavePermissions}
                  disabled={!dirty || saving}
                  className="rounded-pill bg-cente-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-cente-red-600 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save permissions'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {permissions.map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-start gap-2 rounded-sm border border-ink-100 px-3 py-2 text-sm dark:border-ink-700"
                >
                  <input
                    type="checkbox"
                    checked={grantedKeys.includes(perm.key)}
                    disabled={!canManage}
                    onChange={() => togglePermission(perm.key)}
                    className="mt-0.5 accent-cente-blue-600"
                  />
                  <span>
                    <span className="block font-medium text-ink-700 dark:text-ink-50">
                      {perm.name}
                    </span>
                    {perm.description && (
                      <span className="block text-xs text-ink-400">{perm.description}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3">
              {savedAt && !dirty && <span className="text-xs text-success">Saved</span>}
              {error && <span className="text-xs text-cente-red-600">{error}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

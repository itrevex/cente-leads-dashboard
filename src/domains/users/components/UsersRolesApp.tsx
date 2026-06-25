import { useState } from 'react';
import { UsersRound, ShieldCheck } from 'lucide-react';
import type { DashboardUser, Role, DashboardPermission, BranchOption } from '../types';
import UsersTab from './UsersTab';
import RolesTab from './RolesTab';

interface Props {
  initialUsers: DashboardUser[];
  initialRoles: Role[];
  permissions: DashboardPermission[];
  branchOptions: BranchOption[];
  canManage: boolean;
}

type TabKey = 'users' | 'roles';

const TABS: { key: TabKey; label: string; icon: typeof UsersRound }[] = [
  { key: 'users', label: 'Users', icon: UsersRound },
  { key: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
];

export default function UsersRolesApp({
  initialUsers,
  initialRoles,
  permissions,
  branchOptions,
  canManage,
}: Props) {
  const [tab, setTab] = useState<TabKey>('users');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-cente-blue-600 dark:text-cente-blue-300">
          Users & Roles
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
          {initialUsers.length} user{initialUsers.length === 1 ? '' : 's'} · {initialRoles.length}{' '}
          role{initialRoles.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mb-4 flex gap-1 border-b border-ink-100 dark:border-ink-700">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
              tab === key
                ? 'border-cente-blue-600 text-cente-blue-600 dark:text-cente-blue-300'
                : 'border-transparent text-ink-500 hover:text-ink-700 dark:text-ink-300'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <UsersTab
          initialUsers={initialUsers}
          roles={initialRoles}
          branchOptions={branchOptions}
          canManage={canManage}
        />
      )}
      {tab === 'roles' && (
        <RolesTab initialRoles={initialRoles} permissions={permissions} canManage={canManage} />
      )}
    </div>
  );
}

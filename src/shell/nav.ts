import type { PermissionKey } from '../shared/types';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  // null/undefined = visible to every dashboard-credentialed role
  // (e.g. Overview) with no corresponding DashboardPermission row.
  requiredPermission?: PermissionKey;
  count?: number;
  alert?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const WORKSPACE: NavItem[] = [
  { id: 'overview', label: 'Overview', href: '/', icon: 'layout-dashboard' },
  {
    id: 'leads',
    label: 'Leads',
    href: '/leads',
    icon: 'inbox',
    // The all-leads list is the cross-branch HQ queue, so it's gated on
    // view_all_branches rather than view_leads — branch-restricted roles
    // (loan officer, branch officer/manager) work out of "My Leads" only.
    requiredPermission: 'view_all_branches',
  },
  {
    id: 'queue-mine',
    label: 'My Leads',
    href: '/leads/mine',
    icon: 'user-check',
    requiredPermission: 'view_leads',
    alert: true,
  },
];

const CONFIGURATION: NavItem[] = [
  {
    id: 'products',
    label: 'Loan Products',
    href: '/products',
    icon: 'package',
    requiredPermission: 'view_products',
  },
  {
    id: 'users',
    label: 'Users & Roles',
    href: '/users',
    icon: 'users-round',
    requiredPermission: 'view_users',
  },
  {
    id: 'branches',
    label: 'Branch Network',
    href: '/branches',
    icon: 'building-2',
    requiredPermission: 'view_branches',
  },
  {
    id: 'agents',
    label: 'Agents',
    href: '/agents',
    icon: 'user-round-check',
    requiredPermission: 'view_agents',
  },
  {
    id: 'cooperatives',
    label: 'Cooperatives',
    href: '/cooperatives',
    icon: 'landmark',
    requiredPermission: 'view_cooperatives',
    alert: true,
  },
];

const INSIGHTS: NavItem[] = [
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: 'bar-chart-3',
    requiredPermission: 'view_reports',
  },
  {
    id: 'audit',
    label: 'Audit Log',
    href: '/audit',
    icon: 'file-search',
    requiredPermission: 'view_audit',
  },
];

// Permission-driven (ADR-0009 Role/DashboardPermission/RolePermission) —
// an item shows up for any role granted its requiredPermission, with no
// role-name literal anywhere in this module. An admin granting a new
// permission to a custom role makes the matching nav item appear with
// no code change here.
export function navForPermissions(permissions: PermissionKey[]): NavSection[] {
  const granted = new Set(permissions);
  const isVisible = (item: NavItem) =>
    item.requiredPermission == null || granted.has(item.requiredPermission);

  const filterSection = (label: string, items: NavItem[]): NavSection | null => {
    const visible = items.filter(isVisible);
    return visible.length > 0 ? { label, items: visible } : null;
  };

  return [
    filterSection('Workspace', WORKSPACE),
    filterSection('Configuration', CONFIGURATION),
    filterSection('Insights', INSIGHTS),
  ].filter((section): section is NavSection => section !== null);
}

// Attaches live counts (e.g. active-lead totals) to nav items by id —
// kept separate from navForPermissions so the permission-filtering logic
// stays independent of any particular count source.
export function withNavCounts(
  sections: NavSection[],
  countsById: Record<string, number>,
): NavSection[] {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.id in countsById ? { ...item, count: countsById[item.id] } : item,
    ),
  }));
}

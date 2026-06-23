import type { DashboardRole } from '../shared/types';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const WORKSPACE: NavItem[] = [
  { id: 'overview', label: 'Overview', href: '/', icon: 'layout-dashboard' },
  { id: 'leads', label: 'Leads', href: '/leads', icon: 'inbox' },
  { id: 'queue-mine', label: 'My Leads', href: '/leads/mine', icon: 'user-check' },
];

const CONFIGURATION: NavItem[] = [
  { id: 'products', label: 'Loan Products', href: '/products', icon: 'package' },
  { id: 'users', label: 'Users & Roles', href: '/users', icon: 'users-round' },
  { id: 'branches', label: 'Branch Network', href: '/branches', icon: 'building-2' },
  { id: 'agents', label: 'Agents', href: '/agents', icon: 'user-round-check' },
  { id: 'cooperatives', label: 'Cooperatives', href: '/cooperatives', icon: 'landmark' },
];

const INSIGHTS: NavItem[] = [
  { id: 'reports', label: 'Reports', href: '/reports', icon: 'bar-chart-3' },
  { id: 'audit', label: 'Audit Log', href: '/audit', icon: 'file-search' },
];

// Per ADR-0009's role/permission model — mirrors what each role can already
// reach on the backend, not an independent guess at UI affordances.
const NAV_ITEM_IDS_BY_ROLE: Record<DashboardRole, Set<string>> = {
  head_of_loans: new Set([
    'overview',
    'leads',
    'queue-mine',
    'branches',
    'cooperatives',
    'agents',
    'products',
    'users',
    'reports',
    'audit',
  ]),
  compliance_officer: new Set(['overview', 'leads', 'reports', 'audit']),
  system_admin: new Set([
    'overview',
    'users',
    'products',
    'agents',
    'cooperatives',
    'reports',
    'audit',
  ]),
  mcp_officer: new Set(['overview', 'leads', 'branches', 'reports', 'audit']),
  branch_manager: new Set(['overview', 'leads', 'queue-mine', 'agents', 'cooperatives', 'reports']),
  branch_officer: new Set(['overview', 'leads', 'queue-mine']),
  loan_officer: new Set(['overview', 'leads', 'queue-mine']),
  auditor: new Set(['overview', 'reports', 'audit']),
};

export function navForRole(role: DashboardRole): NavSection[] {
  const allowed = NAV_ITEM_IDS_BY_ROLE[role] ?? new Set<string>();
  const filterSection = (label: string, items: NavItem[]): NavSection | null => {
    const visible = items.filter((item) => allowed.has(item.id));
    return visible.length > 0 ? { label, items: visible } : null;
  };

  return [
    filterSection('Workspace', WORKSPACE),
    filterSection('Configuration', CONFIGURATION),
    filterSection('Insights', INSIGHTS),
  ].filter((section): section is NavSection => section !== null);
}

export const systemAdminUser = {
  id: 'user-system-admin',
  email: 'admin@cente.test',
  phone: '+256700000001',
  full_name: 'System Admin',
  role: 'system_admin',
  branch: 'branch-kampala',
  branch_name: 'Kampala Main',
  status: 'active',
  last_login: '2026-07-08T09:00:00Z',
  last_active_at: '2026-07-08T09:00:00Z',
  permissions: [
    'view_leads',
    'approve_leads',
    'recommend_decline',
    'decline_leads',
    'reassign_leads',
    'view_reports',
    'export_data',
    'manage_users',
    'manage_products',
    'view_audit',
    'manage_branches',
    'manage_agents',
    'view_all_branches',
    'view_branches',
    'view_cooperatives',
    'view_products',
    'view_users',
    'view_agents',
  ],
  can_be_reviewing_officer: true,
};

// ADR-0034: can Recommend and "Recommend Decline" (flag only), not Decline.
// last_active_at is computed relative to "now" (not a fixed date) so
// formatLastActivity() always renders a stable, assertable "N minutes ago"
// regardless of when the test suite runs.
export const loanOfficerUser = {
  id: 'user-loan-officer',
  email: 'loan.officer@cente.test',
  phone: '+256700000002',
  full_name: 'Demo Loan Officer',
  role: 'loan_officer',
  branch: 'branch-kampala',
  branch_name: 'Kampala Main',
  status: 'active',
  last_login: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  last_active_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  permissions: ['view_leads', 'recommend_decline', 'view_reports', 'view_products'],
  can_be_reviewing_officer: true,
};

// ADR-0034: can Recommend and Decline directly (final), and Reassign.
export const branchManagerUser = {
  id: 'user-branch-manager',
  email: 'branch.manager@cente.test',
  phone: '+256700000003',
  full_name: 'Demo Branch Manager',
  role: 'branch_manager',
  branch: 'branch-kampala',
  branch_name: 'Kampala Main',
  status: 'active',
  last_login: null,
  last_active_at: null,
  permissions: [
    'view_leads',
    'recommend_decline',
    'decline_leads',
    'view_reports',
    'view_agents',
    'view_cooperatives',
    'view_products',
  ],
  can_be_reviewing_officer: true,
};

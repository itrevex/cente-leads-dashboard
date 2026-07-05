// Dashboard-credentialed roles only — agent/chairperson/coop_secretary are
// mobile-only and have no Role permission row (ADR-0009), so they can never
// reach this app even though the backend's UserRole enum includes them.
export type DashboardRole =
  | 'branch_officer'
  | 'branch_manager'
  | 'loan_officer'
  | 'head_of_loans'
  | 'compliance_officer'
  | 'mcp_officer'
  | 'system_admin'
  | 'auditor';

export type UserStatus = 'active' | 'disabled';

// Mirrors apps.roles.permissions.PermissionKeys (backend) — kept as a
// plain string here (not an enum) since admins can grant arbitrary
// custom DashboardPermission keys to custom roles at runtime; this
// union only documents the keys frontend code currently branches on.
export type PermissionKey =
  | 'view_leads'
  | 'approve_leads'
  | 'approve_leaders'
  | 'recommend_decline'
  | 'view_reports'
  | 'export_data'
  | 'manage_users'
  | 'manage_products'
  | 'view_audit'
  | 'manage_branches'
  | 'manage_agents'
  | 'view_all_branches'
  | 'view_branches'
  | 'view_cooperatives'
  | 'view_products'
  | 'view_users'
  | 'view_agents'
  | string;

export interface CurrentUser {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: DashboardRole;
  branch: string | null;
  branch_name: string | null;
  status: UserStatus;
  // Resolved permission-key set for this user's role (apps.accounts.
  // serializers.UserSerializer.get_permissions) — drives nav visibility
  // and scope decisions instead of hardcoded role-name checks.
  permissions: PermissionKey[];
  // Whether this user's role is ever eligible to be a Lead.
  // reviewing_officer (apps.accounts.models.UserRole.reviewing_officer_roles)
  // — determines "My Leads" scope semantics.
  can_be_reviewing_officer: boolean;
}

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

export interface CurrentUser {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: DashboardRole;
  branch: string | null;
  status: UserStatus;
}

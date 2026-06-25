import type { DashboardRole } from '../../shared/types';

export const ROLE_LABELS: Record<DashboardRole, string> = {
  branch_officer: 'Branch Officer',
  branch_manager: 'Branch Manager',
  loan_officer: 'Loan Officer',
  head_of_loans: 'Head of Loans',
  compliance_officer: 'Compliance Officer',
  mcp_officer: 'MCP Officer',
  system_admin: 'System Admin',
  auditor: 'Auditor',
};

export const DASHBOARD_ROLES: DashboardRole[] = [
  'branch_officer',
  'branch_manager',
  'loan_officer',
  'head_of_loans',
  'compliance_officer',
  'mcp_officer',
  'system_admin',
  'auditor',
];

import type { DashboardRole } from '../../shared/types';

export const ROLE_LABELS: Record<DashboardRole, string> = {
  branch_manager: 'Branch Manager',
  loan_officer: 'Loan Officer',
  head_of_loans: 'Head of Loans',
  compliance_officer: 'Compliance Officer',
  mcp_officer: 'MCP Officer',
  system_admin: 'System Admin',
  auditor: 'Auditor',
};

export const DASHBOARD_ROLES: DashboardRole[] = [
  'branch_manager',
  'loan_officer',
  'head_of_loans',
  'compliance_officer',
  'mcp_officer',
  'system_admin',
  'auditor',
];

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatLastActivity(isoTimestamp: string | null): string {
  if (!isoTimestamp) return 'Never';

  const seconds = (new Date(isoTimestamp).getTime() - Date.now()) / 1000;
  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return relativeTimeFormatter.format(Math.round(seconds / secondsInUnit), unit);
    }
  }
  return relativeTimeFormatter.format(Math.round(seconds), 'second');
}

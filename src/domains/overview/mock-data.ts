// Sample data standing in for endpoints the backend doesn't expose yet
// (recent activity feed, 12-week trend, stage mix breakdown). Swap for real
// API calls once /reports/overview/ grows these fields.

export interface RecentLead {
  id: string;
  applicant: string;
  initials: string;
  nin: string;
  source: 'agent' | 'branch';
  cooperative: string;
  amountUgx: number;
  status: 'chair_pending' | 'review' | 'info_requested' | 'returned' | 'recommended' | 'declined';
  branch: string;
}

export const RECENT_LEADS: RecentLead[] = [
  {
    id: 'CL-2026-04812',
    applicant: 'Andrew Kwesiga',
    initials: 'AK',
    nin: 'CM12345678',
    source: 'agent',
    cooperative: 'Tukolere Wamu SACCO',
    amountUgx: 19_500_000,
    status: 'review',
    branch: 'Mapeera House',
  },
  {
    id: 'CL-2026-04808',
    applicant: 'Mary Namutebi',
    initials: 'MN',
    nin: 'CM23456789',
    source: 'agent',
    cooperative: 'Bagwe Farmers Group',
    amountUgx: 6_500_000,
    status: 'returned',
    branch: 'Entebbe Road',
  },
  {
    id: 'CL-2026-04801',
    applicant: 'Geoffrey Wamala',
    initials: 'GW',
    nin: 'CM34567890',
    source: 'branch',
    cooperative: 'Mbarara Farmers SACCO',
    amountUgx: 45_000_000,
    status: 'recommended',
    branch: 'Gulu Branch',
  },
  {
    id: 'CL-2026-04795',
    applicant: 'Lilian Ajon',
    initials: 'LA',
    nin: 'CM45678901',
    source: 'agent',
    cooperative: 'Gulu Traders SACCO',
    amountUgx: 3_000_000,
    status: 'declined',
    branch: 'Gulu Branch',
  },
  {
    id: 'CL-2026-04793',
    applicant: 'Joseph Ssemwanga',
    initials: 'JS',
    nin: 'CM56789012',
    source: 'branch',
    cooperative: '',
    amountUgx: 100_180_000,
    status: 'review',
    branch: 'Entebbe Road',
  },
  {
    id: 'CL-2026-04790',
    applicant: 'Rebecca Auma',
    initials: 'RA',
    nin: 'CM67890123',
    source: 'agent',
    cooperative: 'Mbarara Farmers SACCO',
    amountUgx: 35_000_000,
    status: 'chair_pending',
    branch: 'Mbarara Branch',
  },
];

export const TREND_12W = [62, 58, 71, 65, 80, 74, 69, 77, 83, 79, 90, 87];

export const STAGE_MIX = [
  {
    key: 'review',
    icon: 'clipboard-list',
    color: 'blue',
    label: 'Bank Reviewing',
    sub: 'Leads currently under bank review',
  },
  {
    key: 'chairPending',
    icon: 'clock',
    color: 'yellow',
    label: 'Chair Pending',
    sub: 'Pending chairperson sign-off',
  },
  {
    key: 'returned',
    icon: 'rotate-ccw',
    color: 'yellow',
    label: 'Returned to Agent',
    sub: 'Returned for correction and resubmission',
  },
] as const;

export const STATUS_META: Record<
  string,
  { label: string; color: 'neutral' | 'yellow' | 'blue' | 'green' | 'red' }
> = {
  draft: { label: 'Draft', color: 'neutral' },
  chair_pending: { label: 'Chair Pending', color: 'yellow' },
  review: { label: 'Bank Reviewing', color: 'blue' },
  info_requested: { label: 'Info Requested', color: 'yellow' },
  returned: { label: 'Returned to Agent', color: 'yellow' },
  recommended: { label: 'Recommended', color: 'green' },
  declined: { label: 'Declined', color: 'red' },
};

export function formatUgx(amount: number): string {
  return `UGX ${amount.toLocaleString('en-US')}`;
}

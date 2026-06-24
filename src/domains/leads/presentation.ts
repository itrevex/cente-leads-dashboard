export { STATUS_META, formatUgx, initialsOf } from '../../shared/lead-presentation';

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'chair_pending', label: 'Chair Pending' },
  { value: 'review', label: 'Bank Reviewing' },
  { value: 'info_requested', label: 'Info Requested' },
  { value: 'returned', label: 'Returned to Agent' },
  { value: 'recommended', label: 'Recommended' },
  { value: 'declined', label: 'Declined' },
] as const;

export const SOURCE_FILTER_OPTIONS = [
  { value: '', label: 'All sources' },
  { value: 'agent_referral', label: 'Field agent' },
  { value: 'bank_officer_capture', label: 'Branch' },
] as const;

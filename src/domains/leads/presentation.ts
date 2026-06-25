export { STATUS_META, formatUgx, initialsOf } from '../../shared/lead-presentation';

// Filter-chip buckets above the leads table (prototype's `buckets` in
// screens-main.jsx) — '' means "All".
export const STATUS_BUCKETS = [
  { value: '', label: 'All' },
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

// Mirrors apps.leads.transitions.py's AuditEvent action strings — see
// the exhaustive grep in that file for the full real list (no backend
// label endpoint exists; these are display labels only).
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'lead.created': 'Lead created',
  'lead.updated': 'Lead updated',
  'lead.submitted': 'Submitted',
  'chair.endorsed': 'Chair endorsed',
  'chair.rejected': 'Chair rejected',
  'lead.info_requested': 'Information requested',
  'lead.info_provided': 'Information provided',
  'lead.returned': 'Returned to agent',
  'lead.reopened': 'Reopened by agent',
  'lead.recommended': 'Recommended for appraisal',
  'lead.declined': 'Declined',
  'lead.reassigned': 'Reassigned',
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  national_id: 'National ID',
  payslip: 'Payslip',
  premises_photo: 'Premises Photo',
  guarantor_consent: 'Guarantor Consent',
  application_form: 'Application Form',
  other: 'Other',
};

export const UPLOAD_STATUS_META: Record<
  string,
  { label: string; color: 'neutral' | 'yellow' | 'blue' | 'green' | 'red' }
> = {
  pending: { label: 'Pending', color: 'yellow' },
  uploaded: { label: 'Uploaded', color: 'green' },
  failed: { label: 'Failed', color: 'red' },
};

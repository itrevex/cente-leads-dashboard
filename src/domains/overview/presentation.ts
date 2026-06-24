// The curated Stage Mix subset is an Overview-specific presentation
// choice; status labels/colors and other generic lead-display helpers
// live in shared/lead-presentation.ts since the Leads list page needs
// them too.

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

export { STATUS_META, formatUgx, initialsOf } from '../../shared/lead-presentation';

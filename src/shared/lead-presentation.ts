// Generic lead-display helpers shared by any page rendering Lead rows
// (Overview's recent-activity table, the Leads list page, etc.) — status
// labels/colors are presentation choices, not fabricated numbers; the
// counts/rows themselves always come from the API.

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

// amount_requested arrives from the API in minor units (cents per
// apps.leads.models.Lead.amount_requested) — divide by 100 for display.
export function formatUgx(minorUnits: number): string {
  return `UGX ${Math.round(minorUnits / 100).toLocaleString('en-US')}`;
}

export function initialsOf(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

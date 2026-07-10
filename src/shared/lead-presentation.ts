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
  decline_recommended: { label: 'Decline Recommended', color: 'yellow' },
  recommended: { label: 'Recommended', color: 'green' },
  declined: { label: 'Declined', color: 'red' },
};

// Amounts are whole UGX end-to-end (ADR-0035) — no cents, no conversion.
export function formatUgx(amount: number): string {
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
}

// Mirrors apps.leads.models.LeadStatus.terminal_states() — a lead that's
// recommended or declined is done, not part of an "active pipeline" count.
export function activeCount(byStatus: Record<string, number>, all: number): number {
  return all - (byStatus.recommended ?? 0) - (byStatus.declined ?? 0);
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

// Links a lead detail page's chairperson name to the leads list scoped to
// everything awaiting that chairperson's sign-off — combines chairperson
// with status=chair_pending (apps.leads.models.LeadStatus.CHAIR_PENDING) so
// leads mid-bank-review (status=review) aren't mistakenly included.
export function chairpersonPendingReviewHref(chairpersonId: string): string {
  return `/leads?chairperson=${chairpersonId}&status=chair_pending`;
}

// Links an agent's name (e.g. on the Chair Approval card) to the leads
// list scoped to everything that agent has captured.
export function agentLeadsHref(agentId: string): string {
  return `/leads?assigned_agent=${agentId}`;
}

// Removes the chairperson query param (and resets pagination, since the
// result set is about to change) while preserving every other active
// filter — used by the leads list page's "Clear" affordance on the
// chairperson-filter banner.
export function clearChairpersonHref(basePath: string, params: URLSearchParams): string {
  const next = new URLSearchParams(params);
  next.delete('chairperson');
  next.delete('page');
  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

const now = '2026-06-21T09:00:00Z';

export const viewLeadsPermission = {
  id: 'perm-view-leads',
  key: 'view_leads',
  name: 'View leads',
  description: 'See leads in the officer’s branch.',
  is_system: true,
  created_at: now,
  updated_at: now,
};

export const recommendDeclinePermission = {
  id: 'perm-recommend-decline',
  key: 'recommend_decline',
  name: 'Act on leads under review',
  description: 'Recommend, request info, return to agent, or flag decline.',
  is_system: true,
  created_at: now,
  updated_at: now,
};

export const declineLeadsPermission = {
  id: 'perm-decline-leads',
  key: 'decline_leads',
  name: 'Decline leads',
  description: 'Finalize a decline decision on a lead under review.',
  is_system: true,
  created_at: now,
  updated_at: now,
};

export const permissions = [
  viewLeadsPermission,
  recommendDeclinePermission,
  declineLeadsPermission,
];

// ADR-0034: loan_officer holds recommend_decline (flag/recommend) but not
// decline_leads (finalize) -- the exact grant set this session's backend
// migration seeds.
export const loanOfficerRole = {
  id: 'role-loan-officer',
  key: 'loan_officer',
  name: 'Loan Officer',
  description: 'Reviews leads under bank review.',
  is_builtin: true,
  permissions: [
    { id: 'grant-1', key: viewLeadsPermission.key, name: viewLeadsPermission.name },
    { id: 'grant-2', key: recommendDeclinePermission.key, name: recommendDeclinePermission.name },
  ],
  created_at: now,
  updated_at: now,
};

export const branchManagerRole = {
  id: 'role-branch-manager',
  key: 'branch_manager',
  name: 'Branch Manager',
  description: 'Oversees a single branch, can finalize lead decisions.',
  is_builtin: true,
  permissions: [
    { id: 'grant-3', key: viewLeadsPermission.key, name: viewLeadsPermission.name },
    { id: 'grant-4', key: recommendDeclinePermission.key, name: recommendDeclinePermission.name },
    { id: 'grant-5', key: declineLeadsPermission.key, name: declineLeadsPermission.name },
  ],
  created_at: now,
  updated_at: now,
};

export const roles = [loanOfficerRole, branchManagerRole];

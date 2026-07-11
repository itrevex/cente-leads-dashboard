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

export const recommendLeadsPermission = {
  id: 'perm-recommend-leads',
  key: 'recommend_leads',
  name: 'Recommend leads',
  description: 'Recommend a lead for appraisal.',
  is_system: true,
  created_at: now,
  updated_at: now,
};

export const flagDeclineLeadsPermission = {
  id: 'perm-flag-decline-leads',
  key: 'flag_decline_leads',
  name: 'Flag for decline',
  description: 'Flag a lead for decline without finalizing it.',
  is_system: true,
  created_at: now,
  updated_at: now,
};

export const requestInfoLeadsPermission = {
  id: 'perm-request-info-leads',
  key: 'request_info_leads',
  name: 'Request info',
  description: 'Request more information from the agent on a lead under review.',
  is_system: true,
  created_at: now,
  updated_at: now,
};

export const returnToAgentLeadsPermission = {
  id: 'perm-return-to-agent-leads',
  key: 'return_to_agent_leads',
  name: 'Return to agent',
  description: 'Return a lead under review to the agent.',
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
  recommendLeadsPermission,
  flagDeclineLeadsPermission,
  requestInfoLeadsPermission,
  returnToAgentLeadsPermission,
  declineLeadsPermission,
];

// 0010_split_recommend_decline_permissions: loan_officer holds the four
// review-stage actions but not decline_leads (finalize) -- the exact grant
// set this session's backend migration seeds.
export const loanOfficerRole = {
  id: 'role-loan-officer',
  key: 'loan_officer',
  name: 'Loan Officer',
  description: 'Reviews leads under bank review.',
  is_builtin: true,
  permissions: [
    { id: 'grant-1', key: viewLeadsPermission.key, name: viewLeadsPermission.name },
    {
      id: 'grant-2',
      key: recommendLeadsPermission.key,
      name: recommendLeadsPermission.name,
    },
    {
      id: 'grant-6',
      key: flagDeclineLeadsPermission.key,
      name: flagDeclineLeadsPermission.name,
    },
    {
      id: 'grant-7',
      key: requestInfoLeadsPermission.key,
      name: requestInfoLeadsPermission.name,
    },
    {
      id: 'grant-8',
      key: returnToAgentLeadsPermission.key,
      name: returnToAgentLeadsPermission.name,
    },
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
    {
      id: 'grant-4',
      key: recommendLeadsPermission.key,
      name: recommendLeadsPermission.name,
    },
    { id: 'grant-5', key: declineLeadsPermission.key, name: declineLeadsPermission.name },
  ],
  created_at: now,
  updated_at: now,
};

export const roles = [loanOfficerRole, branchManagerRole];

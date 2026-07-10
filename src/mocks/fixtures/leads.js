const now = '2026-07-08T09:00:00Z';

export function makeLead(overrides = {}) {
  return {
    id: 'lead-001',
    branch: 'branch-kampala',
    branch_name: 'Kampala Main',
    cooperative: 'coop-001',
    cooperative_name: 'Tukolere Wamu SACCO',
    chairperson_detail: {
      id: 'user-chair-001',
      full_name: 'Demo Chairperson',
      phone: '+256700000030',
      leader_approval_status: 'approved',
    },
    secretary_detail: null,
    member: 'member-001',
    loan_product: 'product-salary-001',
    form_schema: 'schema-salary-v1',
    assigned_agent: 'user-agent-001',
    assigned_agent_name: 'Demo Agent',
    reviewing_officer: null,
    reviewing_officer_name: null,
    initiation_source: 'agent_referral',
    source_label: 'Field Agent',
    amount_requested: 5000000,
    currency: 'UGX',
    term_months: 12,
    purpose: 'Working capital',
    applicant_snapshot: {},
    form_answers: {},
    status: 'review',
    decline_reason: '',
    applicant_name: 'Andrew Kwesiga',
    applicant_nin: 'CM12345678',
    applicant_phone: '+256770000020',
    submitted_at: now,
    decided_at: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

export function makeStatusCounts(overrides = {}) {
  return {
    all: 1,
    by_status: {
      draft: 0,
      chair_pending: 0,
      review: 1,
      info_requested: 0,
      returned: 0,
      decline_recommended: 0,
      recommended: 0,
      declined: 0,
    },
    ...overrides,
  };
}

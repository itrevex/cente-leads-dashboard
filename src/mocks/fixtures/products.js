const now = '2026-06-27T09:00:00Z';

export function makeProduct(overrides = {}) {
  return {
    id: 'product-salary-001',
    code: 'SAL-001',
    name: 'Salary Advance',
    segment: 'salary',
    description: 'Short-term salary-backed loan.',
    min_amount: 5000000,
    max_amount: 500000000,
    currency: 'UGX',
    interest_rate_bps: 1800,
    processing_fee_bps: 250,
    min_term_months: 1,
    max_term_months: 12,
    requires_chair_approval: false,
    active_form_schema: 'schema-salary-v1',
    branch_availability: ['branch-kampala', 'branch-mukono'],
    is_active: true,
    applications_mtd: 26,
    approval_rate: 81,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

export function makeSchema(overrides = {}) {
  return {
    id: 'schema-salary-v1',
    loan_product: 'product-salary-001',
    version: 1,
    status: 'draft',
    published_at: null,
    retired_at: null,
    created_by: 'user-system-admin',
    steps: [
      {
        id: 'step-applicant',
        form_schema: 'schema-salary-v1',
        name: 'Applicant Details',
        description: 'Capture identity and employment details.',
        performed_by: 'branch_officer',
        sla_hours: 4,
        icon: 'user',
        order: 1,
        form_fields: [
          {
            id: 'field-applicant-name',
            key: 'applicant_name',
            label: 'Applicant Name',
            field_type: 'text',
            required: true,
            order: 1,
          },
        ],
        created_at: now,
        updated_at: now,
      },
    ],
    document_requirements: [
      {
        id: 'doc-national-id',
        form_schema: 'schema-salary-v1',
        name: 'National ID',
        description: 'Front and back copy.',
        accepted_format: 'image_or_pdf',
        required: true,
        order: 1,
        created_at: now,
        updated_at: now,
      },
    ],
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

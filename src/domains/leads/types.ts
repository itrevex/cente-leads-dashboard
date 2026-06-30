export interface Lead {
  id: string;
  branch: string;
  branch_name: string;
  cooperative: string | null;
  cooperative_name: string | null;
  member: string | null;
  loan_product: string;
  form_schema: string;
  assigned_agent: string | null;
  assigned_agent_name: string | null;
  reviewing_officer: string | null;
  reviewing_officer_name: string | null;
  initiation_source: 'agent_referral' | 'bank_officer_capture';
  source_label: string;
  amount_requested: number;
  currency: string;
  term_months: number;
  purpose: string;
  applicant_snapshot: Record<string, unknown>;
  form_answers: Record<string, unknown>;
  status: string;
  decline_reason: string;
  applicant_name: string;
  applicant_nin: string;
  applicant_phone: string;
  submitted_at: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  code: string;
  interest_rate_bps: number;
  currency: string;
  segment: string;
}

export interface LeadFormFieldNested {
  id: string;
  key: string;
  label: string;
  field_type: string;
  required: boolean;
  order: number;
}

export interface LeadFormStep {
  id: string;
  name: string;
  description: string;
  performed_by: string;
  order: number;
  form_fields: LeadFormFieldNested[];
}

export interface LeadFormSchema {
  id: string;
  loan_product: string;
  version: number;
  status: string;
  steps: LeadFormStep[];
}

export interface ChairApproval {
  id: string;
  lead: string;
  chairperson: string;
  chairperson_name: string;
  decision: 'endorsed' | 'rejected';
  note: string;
  signed_at: string;
  created_at: string;
}

export interface Comment {
  id: string;
  lead: string;
  author: string;
  author_name: string;
  body: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadDocument {
  id: string;
  lead: string;
  uploaded_by: string;
  doc_type: string;
  storage_path: string;
  content_type: string;
  size_bytes: number | null;
  upload_status: 'pending' | 'uploaded' | 'failed';
  download_url: string | null;
  client_local_id: string | null;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  actor_user: string | null;
  actor_role: string;
  entity_type: string;
  entity_id: string;
  action: string;
  from_state: string;
  to_state: string;
  reason: string;
  payload: Record<string, unknown>;
  occurred_at: string;
  source_surface: 'mobile' | 'dashboard' | 'system';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface StatusCounts {
  all: number;
  by_status: Record<string, number>;
}

export interface LeadFilters {
  status?: string;
  branch?: string;
  cooperative?: string;
  assigned_agent?: string;
  reviewing_officer?: string;
  source?: string;
  search?: string;
  created_from?: string;
  created_to?: string;
  limit?: number;
  offset?: number;
}

export interface Lead {
  id: string;
  branch: string;
  branch_name: string;
  cooperative: string | null;
  cooperative_name: string | null;
  assigned_agent: string | null;
  assigned_agent_name: string | null;
  reviewing_officer: string | null;
  reviewing_officer_name: string | null;
  initiation_source: 'agent_referral' | 'bank_officer_capture';
  source_label: string;
  amount_requested: number;
  currency: string;
  status: string;
  applicant_name: string;
  applicant_nin: string;
  submitted_at: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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

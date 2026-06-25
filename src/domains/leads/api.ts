import { request, ApiError } from '../../shared/api-client';
import type {
  LeadFilters,
  Lead,
  PaginatedResponse,
  LoanProduct,
  LeadFormSchema,
  ChairApproval,
  Comment,
  LeadDocument,
  AuditEvent,
  StatusCounts,
} from './types';

interface NamedOption {
  id: string;
  name: string;
}

interface AgentOption {
  id: string;
  full_name: string;
}

function buildQuery(filters: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getLeads(
  accessToken: string,
  filters: LeadFilters = {},
): Promise<PaginatedResponse<Lead>> {
  return request<PaginatedResponse<Lead>>(
    `/leads/${buildQuery(filters)}`,
    { method: 'GET' },
    accessToken,
  );
}

// Status-bucket chip counts above the leads table — honors every active
// filter except `status` itself, mirroring the prototype's filter chips.
export function getStatusCounts(
  accessToken: string,
  filters: Omit<LeadFilters, 'status' | 'limit' | 'offset'> = {},
): Promise<StatusCounts> {
  return request<StatusCounts>(
    `/leads/status-counts/${buildQuery(filters)}`,
    { method: 'GET' },
    accessToken,
  );
}

// Dropdown option sources for the filter bar — fetched with a generous
// limit since these lists are small (branch/cooperative/agent counts are
// in the dozens, not paginated in the UI).
export async function getBranchOptions(accessToken: string): Promise<NamedOption[]> {
  const page = await request<PaginatedResponse<NamedOption>>(
    '/branches/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export async function getCooperativeOptions(accessToken: string): Promise<NamedOption[]> {
  const page = await request<PaginatedResponse<NamedOption>>(
    '/cooperatives/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export async function getAgentOptions(accessToken: string): Promise<AgentOption[]> {
  const page = await request<PaginatedResponse<AgentOption>>(
    '/agents/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

// Mirrors apps.leads.serializers.REVIEWING_OFFICER_ROLES — only these
// roles can ever be set as Lead.reviewing_officer. /users/ only filters
// by a single role per request, so fetch each in parallel and merge.
export async function getReviewingOfficerOptions(accessToken: string): Promise<AgentOption[]> {
  const roles = ['branch_officer', 'loan_officer', 'head_of_loans'];
  const pages = await Promise.all(
    roles.map((role) =>
      request<PaginatedResponse<AgentOption>>(
        `/users/?role=${role}&limit=200`,
        { method: 'GET' },
        accessToken,
      ),
    ),
  );
  return pages
    .flatMap((page) => page.results)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export function getLead(accessToken: string, id: string): Promise<Lead> {
  return request<Lead>(`/leads/${id}/`, { method: 'GET' }, accessToken);
}

export function getLoanProduct(accessToken: string, id: string): Promise<LoanProduct> {
  return request<LoanProduct>(`/loan-products/${id}/`, { method: 'GET' }, accessToken);
}

export function getFormSchema(accessToken: string, id: string): Promise<LeadFormSchema> {
  return request<LeadFormSchema>(`/form-schemas/${id}/`, { method: 'GET' }, accessToken);
}

export async function getChairApprovals(
  accessToken: string,
  leadId: string,
): Promise<ChairApproval[]> {
  const page = await request<PaginatedResponse<ChairApproval>>(
    `/leads/${leadId}/chair-approvals/`,
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export async function getComments(accessToken: string, leadId: string): Promise<Comment[]> {
  const page = await request<PaginatedResponse<Comment>>(
    `/leads/${leadId}/comments/`,
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export async function getDocuments(accessToken: string, leadId: string): Promise<LeadDocument[]> {
  const page = await request<PaginatedResponse<LeadDocument>>(
    `/leads/${leadId}/documents/`,
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

// Gated on view_audit (ADR-0009) — most lead-owning roles (branch
// officer/manager, loan officer) don't have it, so a 403 here is
// expected and the caller should just omit the timeline, not treat it
// as a page-level error.
export async function getLeadAuditEvents(
  accessToken: string,
  leadId: string,
): Promise<AuditEvent[]> {
  try {
    const page = await request<PaginatedResponse<AuditEvent>>(
      `/audit-events/?entity_type=lead&entity_id=${leadId}&limit=100`,
      { method: 'GET' },
      accessToken,
    );
    return page.results;
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return [];
    }
    throw err;
  }
}

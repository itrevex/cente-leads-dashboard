import { request } from '../../shared/api-client';
import type { LeadFilters, Lead, PaginatedResponse } from './types';

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

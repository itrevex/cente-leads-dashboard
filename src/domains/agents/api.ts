import { request } from '../../shared/api-client';
import type { Agent, BranchOption, CooperativeOption, PaginatedResponse } from './types';

export async function getAgents(accessToken: string): Promise<Agent[]> {
  const page = await request<PaginatedResponse<Agent>>(
    '/agents/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export async function getBranchOptions(accessToken: string): Promise<BranchOption[]> {
  const page = await request<PaginatedResponse<BranchOption>>(
    '/branches/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export async function getCooperativeOptions(accessToken: string): Promise<CooperativeOption[]> {
  const page = await request<PaginatedResponse<CooperativeOption>>(
    '/cooperatives/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

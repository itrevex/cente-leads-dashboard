import { request } from '../../shared/api-client';
import type {
  Cooperative,
  CooperativeMember,
  BranchOption,
  PaginatedResponse,
  PendingLeader,
} from './types';

export async function getCooperatives(accessToken: string): Promise<Cooperative[]> {
  const page = await request<PaginatedResponse<Cooperative>>(
    '/cooperatives/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export function getCooperative(accessToken: string, id: string): Promise<Cooperative> {
  return request<Cooperative>(`/cooperatives/${id}/`, { method: 'GET' }, accessToken);
}

export async function getBranchOptions(accessToken: string): Promise<BranchOption[]> {
  const page = await request<PaginatedResponse<BranchOption>>(
    '/branches/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export async function getCooperativeMembers(
  accessToken: string,
  cooperativeId: string,
): Promise<CooperativeMember[]> {
  const page = await request<PaginatedResponse<CooperativeMember>>(
    `/cooperatives/${cooperativeId}/members/?limit=200`,
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export function getPendingLeaders(accessToken: string): Promise<PendingLeader[]> {
  return request<PendingLeader[]>('/users/pending-leaders/', { method: 'GET' }, accessToken);
}

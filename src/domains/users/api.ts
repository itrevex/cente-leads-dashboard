import { request } from '../../shared/api-client';
import type {
  DashboardUser,
  Role,
  DashboardPermission,
  BranchOption,
  PaginatedResponse,
} from './types';

export async function getUsers(accessToken: string): Promise<DashboardUser[]> {
  const page = await request<PaginatedResponse<DashboardUser>>(
    '/users/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export function getUser(accessToken: string, id: string): Promise<DashboardUser> {
  return request<DashboardUser>(`/users/${id}/`, { method: 'GET' }, accessToken);
}

export async function getRoles(accessToken: string): Promise<Role[]> {
  const page = await request<PaginatedResponse<Role>>(
    '/roles/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export async function getPermissions(accessToken: string): Promise<DashboardPermission[]> {
  const page = await request<PaginatedResponse<DashboardPermission>>(
    '/permissions/?limit=200',
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

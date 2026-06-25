// Browser-side client for the Users & Roles island. Talks only to
// same-origin /api/users/... and /api/roles/... proxy routes (never the
// backend directly) since the access token must stay server-side.
import type { DashboardUser, Role, DashboardPermission, PaginatedResponse } from './types';

export class UsersApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Users API request failed with status ${status}`);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new UsersApiError(response.status, body);
  }
  return body as T;
}

export function listUsers(): Promise<PaginatedResponse<DashboardUser>> {
  return call(`/api/users/`);
}

export function getUser(id: string): Promise<DashboardUser> {
  return call(`/api/users/${id}`);
}

export function createUser(payload: Partial<DashboardUser> & { password?: string }) {
  return call<DashboardUser>(`/api/users/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateUser(id: string, payload: Partial<DashboardUser> & { password?: string }) {
  return call<DashboardUser>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function suspendUser(id: string): Promise<DashboardUser> {
  return call(`/api/users/${id}/suspend`, { method: 'POST' });
}

export function reactivateUser(id: string): Promise<DashboardUser> {
  return call(`/api/users/${id}/reactivate`, { method: 'POST' });
}

export function listRoles(): Promise<PaginatedResponse<Role>> {
  return call(`/api/roles/`);
}

export function getRole(id: string): Promise<Role> {
  return call(`/api/roles/${id}`);
}

export function createRole(payload: { key: string; name: string; description?: string }) {
  return call<Role>(`/api/roles/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateRolePermissions(
  roleId: string,
  permissionKeys: string[],
): Promise<Role['permissions']> {
  return call(`/api/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permission_keys: permissionKeys }),
  });
}

export function listPermissions(): Promise<PaginatedResponse<DashboardPermission>> {
  return call(`/api/permissions/`);
}

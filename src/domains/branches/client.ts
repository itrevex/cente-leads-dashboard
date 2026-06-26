// Browser-side client for the Branch Network island. Talks only to the
// same-origin /api/branches/... proxy route (never the backend directly)
// since the access token must stay server-side.
import type { Branch, PaginatedResponse } from './types';

export class BranchesApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Branches API request failed with status ${status}`);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new BranchesApiError(response.status, body);
  }
  return body as T;
}

export function listBranches(): Promise<PaginatedResponse<Branch>> {
  return call(`/api/branches/`);
}

export function createBranch(payload: Partial<Branch>): Promise<Branch> {
  return call(`/api/branches/`, { method: 'POST', body: JSON.stringify(payload) });
}

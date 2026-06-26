// Browser-side client for the Cooperatives island. Talks only to the
// same-origin /api/cooperatives/... proxy route (never the backend
// directly) since the access token must stay server-side.
import type { Cooperative, CooperativeMember, PaginatedResponse } from './types';

export class CooperativesApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Cooperatives API request failed with status ${status}`);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new CooperativesApiError(response.status, body);
  }
  return body as T;
}

export function listCooperatives(): Promise<PaginatedResponse<Cooperative>> {
  return call(`/api/cooperatives/`);
}

export interface CooperativePayload {
  name: string;
  registration_number: string;
  type: string;
  district?: string;
  branches: string[];
  contact_phone: string;
  contact_email?: string;
}

export function createCooperative(payload: CooperativePayload): Promise<Cooperative> {
  return call(`/api/cooperatives/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateCooperative(
  id: string,
  payload: Partial<CooperativePayload> & { status?: string },
): Promise<Cooperative> {
  return call(`/api/cooperatives/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function listCooperativeMembers(
  cooperativeId: string,
): Promise<PaginatedResponse<CooperativeMember>> {
  return call(`/api/cooperatives/${cooperativeId}/members/`);
}

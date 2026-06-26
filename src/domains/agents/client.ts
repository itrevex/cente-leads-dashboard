// Browser-side client for the Agents island. Talks only to the same-origin
// /api/agents/... proxy route (never the backend directly) since the
// access token must stay server-side.
import type { Agent, PaginatedResponse } from './types';

export class AgentsApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Agents API request failed with status ${status}`);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new AgentsApiError(response.status, body);
  }
  return body as T;
}

export function listAgents(): Promise<PaginatedResponse<Agent>> {
  return call(`/api/agents/`);
}

export interface CreateAgentPayload {
  full_name: string;
  phone: string;
  email?: string;
  branch_ids: string[];
  cooperative_id?: string;
  new_cooperative_name?: string;
}

export function createAgent(payload: CreateAgentPayload): Promise<Agent> {
  return call(`/api/agents/`, { method: 'POST', body: JSON.stringify(payload) });
}

export interface UpdateAgentPayload {
  full_name?: string;
  phone?: string;
  status?: Agent['status'];
  branch_ids?: string[];
}

export function updateAgent(id: string, payload: UpdateAgentPayload): Promise<Agent> {
  return call(`/api/agents/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

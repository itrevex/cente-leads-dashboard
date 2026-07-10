// Browser-side client for lead decision actions. Talks only to the
// same-origin /api/leads/... proxy route (never the backend directly) since
// the access token must stay server-side.
import type { Comment, Lead } from './types';

export class LeadsApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Leads API request failed with status ${status}`);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new LeadsApiError(response.status, body);
  }
  return body as T;
}

// Field names mirror apps.leads.serializers: RequestInfoSerializer.reason,
// RecommendLeadSerializer.note, DeclineLeadSerializer.reason.
export function requestInfo(leadId: string, reason: string): Promise<Lead> {
  return call(`/api/leads/${leadId}/request-info/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function recommendLead(leadId: string, note?: string): Promise<Lead> {
  return call(`/api/leads/${leadId}/recommend/`, {
    method: 'POST',
    body: JSON.stringify({ note: note ?? '' }),
  });
}

export function declineLead(leadId: string, reason: string): Promise<Lead> {
  return call(`/api/leads/${leadId}/decline/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// DeclineLeadSerializer shape (reason mandatory) — flags a lead as
// decline_recommended without finalizing it (ADR-0034, loan_officer only).
export function recommendDecline(leadId: string, reason: string): Promise<Lead> {
  return call(`/api/leads/${leadId}/recommend-decline/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// ReturnToAgentSerializer: reasons (non-empty list, no fixed backend
// vocabulary — free text per reason), note (optional).
export function returnToAgent(leadId: string, reasons: string[], note?: string): Promise<Lead> {
  return call(`/api/leads/${leadId}/return-to-agent/`, {
    method: 'POST',
    body: JSON.stringify({ reasons, note: note ?? '' }),
  });
}

// CommentSerializer: body (required), is_internal (boolean). lead/author are
// set server-side from the URL/auth — never client-supplied.
export function addComment(leadId: string, body: string, isInternal: boolean): Promise<Comment> {
  return call(`/api/leads/${leadId}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ body, is_internal: isInternal }),
  });
}

// ReassignLeadSerializer: at least one of agent_id/reviewing_officer_id
// must be supplied (ADR-0020/0021) — not a status transition.
export function reassignLead(
  leadId: string,
  payload: { agent_id?: string; reviewing_officer_id?: string },
): Promise<Lead> {
  return call(`/api/leads/${leadId}/reassign/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface ReassignCandidate {
  id: string;
  full_name: string;
  role: string;
}

export function getReassignCandidates(): Promise<{
  agents: ReassignCandidate[];
  reviewing_officers: ReassignCandidate[];
}> {
  return call(`/api/leads/reassign-candidates/`);
}

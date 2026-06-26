import type { AuditEvent, AuditFilters, PaginatedResponse } from './types';

export class AuditApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Audit API request failed with status ${status}`);
  }
}

function buildQuery(filters: AuditFilters): string {
  const params = new URLSearchParams({ limit: '200' });
  if (filters.occurred_after) params.set('occurred_after', filters.occurred_after);
  if (filters.occurred_before) params.set('occurred_before', filters.occurred_before);
  if (filters.action) params.set('action', filters.action);
  return `?${params.toString()}`;
}

export async function listAuditEvents(filters: AuditFilters): Promise<AuditEvent[]> {
  const response = await fetch(`/api/audit-events${buildQuery(filters)}`);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AuditApiError(response.status, body);
  }
  return (body as PaginatedResponse<AuditEvent>).results;
}

export function auditExportUrl(filters: AuditFilters): string {
  const params = new URLSearchParams();
  if (filters.occurred_after) params.set('occurred_after', filters.occurred_after);
  if (filters.occurred_before) params.set('occurred_before', filters.occurred_before);
  if (filters.action) params.set('action', filters.action);
  const qs = params.toString();
  return `/api/audit-events/export${qs ? `?${qs}` : ''}`;
}

import { request } from '../../shared/api-client';
import type { AuditEvent, PaginatedResponse } from './types';

export async function getAuditEvents(accessToken: string): Promise<AuditEvent[]> {
  const page = await request<PaginatedResponse<AuditEvent>>(
    '/audit-events/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

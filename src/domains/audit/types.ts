export type SourceSurface = 'mobile' | 'dashboard' | 'system';

export interface AuditEvent {
  id: string;
  actor_user: string | null;
  actor_user_name: string;
  actor_role: string;
  entity_type: string;
  entity_id: string;
  action: string;
  from_state: string;
  to_state: string;
  reason: string;
  payload: Record<string, unknown>;
  occurred_at: string;
  source_surface: SourceSurface;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuditFilters {
  occurred_after?: string;
  occurred_before?: string;
  action?: string;
}

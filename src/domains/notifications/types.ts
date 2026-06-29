export interface Notification {
  id: string;
  recipient_user: string;
  recipient_member: string | null;
  channel: 'SMS' | 'PUSH' | 'EMAIL' | 'IN_APP';
  template_code: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  sent_at: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

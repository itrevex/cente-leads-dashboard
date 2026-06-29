// Browser-side client for the Topbar notification bell. Talks only to the
// same-origin /api/notifications/... proxy route (never the backend
// directly) since the access token must stay server-side.
import type { Notification, PaginatedResponse } from './types';

class NotificationsApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Notifications API request failed with status ${status}`);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new NotificationsApiError(response.status, body);
  }
  return body as T;
}

export async function listNotifications(): Promise<Notification[]> {
  const page = await call<PaginatedResponse<Notification>>(`/api/notifications/?limit=20`);
  return page.results;
}

export function markNotificationRead(id: string): Promise<Notification> {
  return call(`/api/notifications/${id}/mark-read/`, { method: 'POST' });
}

export function markAllNotificationsRead(): Promise<null> {
  return call(`/api/notifications/mark-all-read/`, { method: 'POST' });
}

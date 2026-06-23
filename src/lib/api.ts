// Server-side client for cente-leads-backend. Only ever imported from
// middleware/API routes (src/pages/api/**), never from a browser-rendered
// component — the access token must not be reachable from page JS.

import type { CurrentUser, LoginResponse, OverviewReport } from './types';

const API_BASE_URL = import.meta.env.API_BASE_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

async function request<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const body = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }
  return body as T;
}

export function login(phone: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export function verifyOtp(sessionToken: string, code: string) {
  return request<{ access: string; refresh: string }>('/auth/otp/verify/', {
    method: 'POST',
    body: JSON.stringify({ session_token: sessionToken, code }),
  });
}

export function resendOtp(sessionToken: string) {
  return request<null>('/auth/otp/resend/', {
    method: 'POST',
    body: JSON.stringify({ session_token: sessionToken }),
  });
}

export function refreshAccessToken(refreshToken: string) {
  return request<{ access: string; refresh: string }>('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

export function getCurrentUser(accessToken: string): Promise<CurrentUser> {
  return request<CurrentUser>('/users/me/', { method: 'GET' }, accessToken);
}

export function getOverviewReport(accessToken: string): Promise<OverviewReport> {
  return request<OverviewReport>('/reports/overview/', { method: 'GET' }, accessToken);
}

import { request } from '../../shared/api-client';
import type { CurrentUser } from '../../shared/types';
import type { JwtPair, LoginResponse } from './types';

export function login(phone: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export function verifyOtp(sessionToken: string, code: string): Promise<JwtPair> {
  return request<JwtPair>('/auth/otp/verify/', {
    method: 'POST',
    body: JSON.stringify({ session_token: sessionToken, code }),
  });
}

export function resendOtp(sessionToken: string): Promise<null> {
  return request<null>('/auth/otp/resend/', {
    method: 'POST',
    body: JSON.stringify({ session_token: sessionToken }),
  });
}

export function refreshAccessToken(refreshToken: string): Promise<JwtPair> {
  return request<JwtPair>('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

export function getCurrentUser(accessToken: string): Promise<CurrentUser> {
  return request<CurrentUser>('/users/me/', { method: 'GET' }, accessToken);
}

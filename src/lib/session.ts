// Cookie-based session storage. The cookie holds the raw access+refresh
// JWT pair as JSON — the JWTs are already signed by the backend, so this
// cookie doesn't need its own signature; httpOnly+Secure+SameSite is what
// protects it, not an additional wrapper.

import type { AstroCookies } from 'astro';

const COOKIE_NAME = 'cente_session';

interface SessionCookie {
  access: string;
  refresh: string;
}

export function readSession(cookies: AstroCookies): SessionCookie | null {
  const raw = cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.access === 'string' && typeof parsed.refresh === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeSession(cookies: AstroCookies, session: SessionCookie): void {
  cookies.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: import.meta.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // matches backend REFRESH_TOKEN_LIFETIME (30 days)
  });
}

export function clearSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

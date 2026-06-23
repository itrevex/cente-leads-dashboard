import { defineMiddleware } from 'astro:middleware';
import { getCurrentUser, refreshAccessToken, ApiError } from './lib/api';
import { readSession, writeSession, clearSession } from './lib/session';
import { isExpiringSoon } from './lib/jwt';

const PUBLIC_PATHS = new Set(['/login', '/login/verify']);

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith('/api/auth/');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect } = context;
  const pathname = new URL(request.url).pathname;

  if (isPublicPath(pathname)) {
    return next();
  }

  const session = readSession(cookies);
  if (session === null) {
    return redirect('/login');
  }

  let accessToken = session.access;

  if (isExpiringSoon(accessToken)) {
    try {
      const refreshed = await refreshAccessToken(session.refresh);
      accessToken = refreshed.access;
      writeSession(cookies, { access: refreshed.access, refresh: refreshed.refresh });
    } catch {
      clearSession(cookies);
      return redirect('/login');
    }
  }

  try {
    context.locals.user = await getCurrentUser(accessToken);
    context.locals.accessToken = accessToken;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      clearSession(cookies);
      return redirect('/login');
    }
    throw error;
  }

  return next();
});

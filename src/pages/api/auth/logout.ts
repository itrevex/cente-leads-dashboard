import type { APIRoute } from 'astro';
import { clearSession } from '../../../domains/auth/session';

export const POST: APIRoute = async ({ cookies }) => {
  clearSession(cookies);
  return new Response(null, { status: 204 });
};

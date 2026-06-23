import type { APIRoute } from 'astro';
import { clearSession } from '../../../lib/session';

export const POST: APIRoute = async ({ cookies }) => {
  clearSession(cookies);
  return new Response(null, { status: 204 });
};

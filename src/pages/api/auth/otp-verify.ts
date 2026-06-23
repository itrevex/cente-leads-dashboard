import type { APIRoute } from 'astro';
import { verifyOtp, ApiError } from '../../../lib/api';
import { writeSession } from '../../../lib/session';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { session_token, code } = await request.json();

  if (typeof session_token !== 'string' || typeof code !== 'string') {
    return new Response(JSON.stringify({ error: 'session_token and code are required' }), {
      status: 400,
    });
  }

  try {
    const result = await verifyOtp(session_token, code);
    writeSession(cookies, { access: result.access, refresh: result.refresh });
    return new Response(JSON.stringify({ step: 'complete' }), { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(JSON.stringify({ error: 'Invalid or expired code.' }), {
        status: error.status,
      });
    }
    throw error;
  }
};

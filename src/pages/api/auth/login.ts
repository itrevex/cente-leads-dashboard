import type { APIRoute } from 'astro';
import { login } from '../../../domains/auth/api';
import { writeSession } from '../../../domains/auth/session';
import { isOtpSessionResponse } from '../../../domains/auth/types';
import { ApiError } from '../../../shared/api-client';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { phone, password } = await request.json();

  if (typeof phone !== 'string' || typeof password !== 'string') {
    return new Response(JSON.stringify({ error: 'phone and password are required' }), {
      status: 400,
    });
  }

  try {
    const result = await login(phone, password);

    if (isOtpSessionResponse(result)) {
      return new Response(
        JSON.stringify({ step: 'otp_required', session_token: result.session_token }),
        {
          status: 200,
        },
      );
    }

    writeSession(cookies, { access: result.access, refresh: result.refresh });
    return new Response(JSON.stringify({ step: 'complete' }), { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(JSON.stringify({ error: 'Invalid phone or password.' }), {
        status: error.status,
      });
    }
    throw error;
  }
};

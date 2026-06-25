import type { APIContext } from 'astro';

const API_BASE_URL = import.meta.env.API_BASE_URL ?? 'http://localhost:8000/api/v1';

// Shared by the /api/products and /api/form-schemas catch-all proxies (and
// their index routes, which catch-all params can't match on their own) —
// forwards to `${backendSegment}/${path}/${search}` with the server-held
// access token attached, so the browser-rendered Products island never
// holds it directly.
export function createProxyHandler(backendSegment: string) {
  return async ({ params, request, locals }: APIContext) => {
    const path = (params as { path?: string }).path ?? '';
    const search = new URL(request.url).search;
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();

    const segments = [backendSegment, path].filter(Boolean).join('/');
    const response = await fetch(`${API_BASE_URL}/${segments}/${search}`, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${locals.accessToken}`,
      },
      body,
    });

    const responseBody = response.status === 204 ? null : await response.text();
    return new Response(responseBody, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
    });
  };
}

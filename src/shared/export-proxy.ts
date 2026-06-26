import type { APIContext } from 'astro';

const API_BASE_URL = import.meta.env.API_BASE_URL ?? 'http://localhost:8000/api/v1';

// Streams a binary export (CSV/PDF) from the backend through to the
// browser with the server-held access token attached. Unlike
// createProxyHandler, this forwards response.body directly instead of
// response.text() — required for PDF bytes, which .text() would corrupt.
export function createExportProxyHandler(backendPath: string, fallbackFilename: string) {
  return async ({ request, locals }: APIContext) => {
    const search = new URL(request.url).search;
    const response = await fetch(`${API_BASE_URL}/${backendPath}${search}`, {
      headers: { Authorization: `Bearer ${locals.accessToken}` },
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'application/octet-stream',
        'Content-Disposition':
          response.headers.get('Content-Disposition') ??
          `attachment; filename="${fallbackFilename}"`,
      },
    });
  };
}

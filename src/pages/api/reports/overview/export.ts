import type { APIRoute } from 'astro';

const API_BASE_URL = import.meta.env.API_BASE_URL ?? 'http://localhost:8000/api/v1';

export const GET: APIRoute = async ({ locals }) => {
  const response = await fetch(`${API_BASE_URL}/reports/overview/export/`, {
    headers: { Authorization: `Bearer ${locals.accessToken}` },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'text/csv',
      'Content-Disposition':
        response.headers.get('Content-Disposition') ?? 'attachment; filename="report-overview.csv"',
    },
  });
};

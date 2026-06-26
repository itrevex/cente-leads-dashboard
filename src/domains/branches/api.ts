import { request } from '../../shared/api-client';
import type { Branch, PaginatedResponse } from './types';

export async function getBranches(accessToken: string): Promise<Branch[]> {
  const page = await request<PaginatedResponse<Branch>>(
    '/branches/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

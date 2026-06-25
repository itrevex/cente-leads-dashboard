import { request } from '../../shared/api-client';
import type { LoanProduct, BranchOption, LeadFormSchema, PaginatedResponse } from './types';

export async function getProducts(accessToken: string): Promise<LoanProduct[]> {
  const page = await request<PaginatedResponse<LoanProduct>>(
    '/loan-products/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

export function getProduct(accessToken: string, id: string): Promise<LoanProduct> {
  return request<LoanProduct>(`/loan-products/${id}/`, { method: 'GET' }, accessToken);
}

export async function getBranchOptions(accessToken: string): Promise<BranchOption[]> {
  const page = await request<PaginatedResponse<BranchOption>>(
    '/branches/?limit=200',
    { method: 'GET' },
    accessToken,
  );
  return page.results;
}

// Schemas are returned newest-version-first (apps.products.views
// .LeadFormSchemaListCreateView orders by -version), so the latest one is
// always the editing surface — whether it's a draft to keep editing or a
// published/retired version the UI should render read-only.
export async function getLatestFormSchema(
  accessToken: string,
  productId: string,
): Promise<LeadFormSchema | null> {
  const page = await request<PaginatedResponse<LeadFormSchema>>(
    `/loan-products/${productId}/form-schemas/`,
    { method: 'GET' },
    accessToken,
  );
  return page.results[0] ?? null;
}

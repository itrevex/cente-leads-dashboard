// Browser-side client for the Loan Products config island. Talks only to
// same-origin /api/products/... and /api/form-schemas/... proxy routes
// (never the backend directly) since the access token must stay server-side.
import type {
  LoanProduct,
  LeadFormSchema,
  LeadFormStep,
  LeadFormField,
  LeadFormDocumentRequirement,
  PaginatedResponse,
} from './types';

export class ProductsApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Products API request failed with status ${status}`);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ProductsApiError(response.status, body);
  }
  return body as T;
}

export function listProducts(): Promise<PaginatedResponse<LoanProduct>> {
  return call(`/api/products/`);
}

export function getProduct(id: string): Promise<LoanProduct> {
  return call(`/api/products/${id}`);
}

export function createProduct(payload: Partial<LoanProduct>): Promise<LoanProduct> {
  return call(`/api/products/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateProduct(id: string, payload: Partial<LoanProduct>): Promise<LoanProduct> {
  return call(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function duplicateProduct(id: string): Promise<LoanProduct> {
  return call(`/api/products/${id}/duplicate`, { method: 'POST' });
}

export function listFormSchemas(productId: string): Promise<PaginatedResponse<LeadFormSchema>> {
  return call(`/api/products/${productId}/form-schemas`);
}

export function getFormSchema(schemaId: string): Promise<LeadFormSchema> {
  return call(`/api/form-schemas/${schemaId}`);
}

export function createFormSchema(
  productId: string,
  copyFromVersion?: number,
): Promise<LeadFormSchema> {
  return call(`/api/products/${productId}/form-schemas`, {
    method: 'POST',
    body: JSON.stringify(copyFromVersion ? { copy_from_version: copyFromVersion } : {}),
  });
}

export function publishFormSchema(schemaId: string): Promise<LeadFormSchema> {
  return call(`/api/form-schemas/${schemaId}/publish`, { method: 'POST' });
}

export function createStep(
  schemaId: string,
  payload: Partial<LeadFormStep>,
): Promise<LeadFormStep> {
  return call(`/api/form-schemas/${schemaId}/steps`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateStep(
  schemaId: string,
  stepId: string,
  payload: Partial<LeadFormStep>,
): Promise<LeadFormStep> {
  return call(`/api/form-schemas/${schemaId}/steps/${stepId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteStep(schemaId: string, stepId: string): Promise<null> {
  return call(`/api/form-schemas/${schemaId}/steps/${stepId}`, { method: 'DELETE' });
}

export function createField(
  schemaId: string,
  payload: Partial<LeadFormField>,
): Promise<LeadFormField> {
  return call(`/api/form-schemas/${schemaId}/fields`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateField(
  schemaId: string,
  fieldId: string,
  payload: Partial<LeadFormField>,
): Promise<LeadFormField> {
  return call(`/api/form-schemas/${schemaId}/fields/${fieldId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteField(schemaId: string, fieldId: string): Promise<null> {
  return call(`/api/form-schemas/${schemaId}/fields/${fieldId}`, { method: 'DELETE' });
}

export function createDocumentRequirement(
  schemaId: string,
  payload: Partial<LeadFormDocumentRequirement>,
): Promise<LeadFormDocumentRequirement> {
  return call(`/api/form-schemas/${schemaId}/documents`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateDocumentRequirement(
  schemaId: string,
  docId: string,
  payload: Partial<LeadFormDocumentRequirement>,
): Promise<LeadFormDocumentRequirement> {
  return call(`/api/form-schemas/${schemaId}/documents/${docId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteDocumentRequirement(schemaId: string, docId: string): Promise<null> {
  return call(`/api/form-schemas/${schemaId}/documents/${docId}`, { method: 'DELETE' });
}

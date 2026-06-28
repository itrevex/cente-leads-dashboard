import { http, HttpResponse } from 'msw';
import { URL } from 'node:url';

import { paginated, branches } from '../fixtures/branches.js';
import { makeJwtPair, makeJwt } from '../fixtures/jwt.js';
import { overviewReport } from '../fixtures/overview.js';
import { makeProduct, makeSchema } from '../fixtures/products.js';
import { systemAdminUser } from '../fixtures/users.js';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const validPhone = '+256700000001';
const validPassword = 'Passw0rd!';
const validOtp = '123456';
const otpSessionToken = 'otp-session-001';

function json(data, init = {}) {
  return HttpResponse.json(data, init);
}

function ensureAuth(request) {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return json({ detail: 'Authentication credentials were not provided.' }, { status: 401 });
  }
  return null;
}

function authHandlers({ invalidOtp = false, refreshFails = false, directLogin = false } = {}) {
  return [
    http.post(`${API_BASE_URL}/auth/login/`, async ({ request }) => {
      const body = await request.json();
      if (body.phone !== validPhone || body.password !== validPassword) {
        return json({ detail: 'Invalid credentials' }, { status: 401 });
      }
      if (directLogin) {
        return json(makeJwtPair());
      }
      return json({ session_token: otpSessionToken });
    }),
    http.post(`${API_BASE_URL}/auth/otp/verify/`, async ({ request }) => {
      const body = await request.json();
      if (body.session_token !== otpSessionToken) {
        return json({ detail: 'Session not found' }, { status: 401 });
      }
      if (invalidOtp || body.code !== validOtp) {
        return json({ detail: 'Invalid code' }, { status: 401 });
      }
      return json(makeJwtPair());
    }),
    http.post(`${API_BASE_URL}/auth/token/refresh/`, async ({ request }) => {
      const body = await request.json();
      if (refreshFails || body.refresh !== 'refresh-user-system-admin') {
        return json({ detail: 'Token is invalid or expired' }, { status: 401 });
      }
      return json(makeJwtPair());
    }),
    http.get(`${API_BASE_URL}/users/me/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(systemAdminUser);
    }),
    http.get(`${API_BASE_URL}/leads/status-counts/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const url = new URL(request.url);
      const reviewingOfficer = url.searchParams.get('reviewing_officer');
      if (reviewingOfficer === systemAdminUser.id) {
        return json({ all: 6, by_status: { review: 4, chair_pending: 1, returned: 1 } });
      }
      return json({
        all: 48,
        by_status: { submitted: 15, review: 12, chair_pending: 4, returned: 3, approved: 14 },
      });
    }),
  ];
}

function overviewHandlers(authOptions = {}) {
  return [
    ...authHandlers(authOptions),
    http.get(`${API_BASE_URL}/reports/overview/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(overviewReport);
    }),
  ];
}

function productsHandlers() {
  const products = [makeProduct()];
  const schemas = new Map([[products[0].id, [makeSchema()]]]);

  function getSchema(schemaId) {
    return [...schemas.values()].flat().find((entry) => entry.id === schemaId) ?? null;
  }

  function replaceSchema(schemaId, nextSchema) {
    for (const [productId, versions] of schemas.entries()) {
      const index = versions.findIndex((entry) => entry.id === schemaId);
      if (index >= 0) {
        const updated = [...versions];
        updated[index] = nextSchema;
        schemas.set(
          productId,
          updated.sort((a, b) => b.version - a.version),
        );
        return true;
      }
    }
    return false;
  }

  return [
    ...authHandlers(),
    http.get(`${API_BASE_URL}/loan-products/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated(products));
    }),
    http.post(`${API_BASE_URL}/loan-products/`, async ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const body = await request.json();
      if (!body.code || !body.name || body.currency !== 'UGX') {
        return json({ detail: 'Invalid payload' }, { status: 422 });
      }

      const product = makeProduct({
        id: `product-${products.length + 1}`,
        code: body.code,
        name: body.name,
        segment: body.segment,
        min_amount: body.min_amount,
        max_amount: body.max_amount,
        interest_rate_bps: body.interest_rate_bps,
        min_term_months: body.min_term_months,
        max_term_months: body.max_term_months,
        branch_availability: body.branch_availability ?? ['branch-kampala'],
        active_form_schema: null,
        applications_mtd: 0,
        approval_rate: null,
      });
      products.push(product);
      schemas.set(product.id, []);
      return json(product, { status: 201 });
    }),
    http.get(`${API_BASE_URL}/loan-products/:id/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const product = products.find((entry) => entry.id === params.id);
      if (!product) {
        return json({ detail: 'Not found' }, { status: 404 });
      }
      return json(product);
    }),
    http.patch(`${API_BASE_URL}/loan-products/:id/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const body = await request.json();
      const index = products.findIndex((entry) => entry.id === params.id);
      if (index < 0) {
        return json({ detail: 'Not found' }, { status: 404 });
      }
      if (typeof body.name !== 'string' || !Array.isArray(body.branch_availability)) {
        return json({ detail: 'Invalid payload' }, { status: 422 });
      }
      products[index] = {
        ...products[index],
        ...body,
        updated_at: '2026-06-27T10:00:00Z',
      };
      return json(products[index]);
    }),
    http.post(`${API_BASE_URL}/loan-products/:id/duplicate/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const product = products.find((entry) => entry.id === params.id);
      if (!product) {
        return json({ detail: 'Not found' }, { status: 404 });
      }
      const copy = makeProduct({
        ...product,
        id: `${product.id}-copy-${products.length + 1}`,
        code: `${product.code}-COPY`,
        name: `${product.name} Copy`,
        active_form_schema: null,
      });
      products.push(copy);
      schemas.set(copy.id, []);
      return json(copy, { status: 201 });
    }),
    http.get(`${API_BASE_URL}/loan-products/:id/form-schemas/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated(schemas.get(params.id) ?? []));
    }),
    http.post(`${API_BASE_URL}/loan-products/:id/form-schemas/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const product = products.find((entry) => entry.id === params.id);
      if (!product) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const currentVersions = schemas.get(params.id) ?? [];
      const latestVersion = currentVersions[0]?.version ?? 0;
      const nextVersion = latestVersion + 1;
      const schemaId = `${params.id}-schema-v${nextVersion}`;
      const body = await request.json().catch(() => ({}));
      const copyFromVersion = body.copy_from_version;
      const source =
        typeof copyFromVersion === 'number'
          ? currentVersions.find((entry) => entry.version === copyFromVersion)
          : (currentVersions[0] ?? null);

      const nextSchema = {
        ...(source ?? makeSchema({ steps: [], document_requirements: [] })),
        id: schemaId,
        loan_product: params.id,
        version: nextVersion,
        status: 'draft',
        published_at: null,
        retired_at: null,
        created_at: '2026-06-27T10:15:00Z',
        updated_at: '2026-06-27T10:15:00Z',
      };

      schemas.set(params.id, [nextSchema, ...currentVersions]);
      return json(nextSchema, { status: 201 });
    }),
    http.get(`${API_BASE_URL}/form-schemas/:id/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }
      return json(schema);
    }),
    http.post(`${API_BASE_URL}/form-schemas/:id/publish/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const published = {
        ...schema,
        status: 'published',
        published_at: '2026-06-27T10:20:00Z',
        updated_at: '2026-06-27T10:20:00Z',
      };
      replaceSchema(params.id, published);
      return json(published);
    }),
    http.post(`${API_BASE_URL}/form-schemas/:id/steps/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const body = await request.json();
      const step = {
        id: `step-${Math.random().toString(16).slice(2, 10)}`,
        form_schema: schema.id,
        name: body.name,
        description: body.description ?? '',
        performed_by: body.performed_by,
        sla_hours: body.sla_hours,
        icon: body.icon,
        order: body.order ?? schema.steps.length + 1,
        form_fields: [],
        created_at: '2026-06-27T10:25:00Z',
        updated_at: '2026-06-27T10:25:00Z',
      };

      const updated = {
        ...schema,
        steps: [...schema.steps, step].sort((a, b) => a.order - b.order),
        updated_at: '2026-06-27T10:25:00Z',
      };
      replaceSchema(schema.id, updated);
      return json(step, { status: 201 });
    }),
    http.patch(`${API_BASE_URL}/form-schemas/:id/steps/:stepId/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const patch = await request.json();
      const steps = schema.steps.map((entry) =>
        entry.id === params.stepId
          ? { ...entry, ...patch, updated_at: '2026-06-27T10:30:00Z' }
          : entry,
      );
      if (!steps.some((entry) => entry.id === params.stepId)) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const updated = {
        ...schema,
        steps: steps.sort((a, b) => a.order - b.order),
        updated_at: '2026-06-27T10:30:00Z',
      };
      replaceSchema(schema.id, updated);
      return json(updated.steps.find((entry) => entry.id === params.stepId));
    }),
    http.delete(`${API_BASE_URL}/form-schemas/:id/steps/:stepId/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const nextSteps = schema.steps.filter((entry) => entry.id !== params.stepId);
      if (nextSteps.length === schema.steps.length) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const updated = {
        ...schema,
        steps: nextSteps,
        updated_at: '2026-06-27T10:35:00Z',
      };
      replaceSchema(schema.id, updated);
      return new HttpResponse(null, { status: 204 });
    }),
    http.post(`${API_BASE_URL}/form-schemas/:id/fields/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const body = await request.json();
      const stepId = body.step;
      const step = schema.steps.find((entry) => entry.id === stepId);
      if (!step) {
        return json({ detail: 'Step not found' }, { status: 404 });
      }

      const field = {
        id: `field-${Math.random().toString(16).slice(2, 10)}`,
        form_schema: schema.id,
        step: stepId,
        key: body.key,
        label: body.label,
        field_type: body.field_type,
        required: Boolean(body.required),
        order: body.order ?? step.form_fields.length + 1,
        created_at: '2026-06-27T10:40:00Z',
        updated_at: '2026-06-27T10:40:00Z',
      };

      const steps = schema.steps.map((entry) =>
        entry.id === stepId
          ? {
              ...entry,
              form_fields: [...entry.form_fields, field].sort((a, b) => a.order - b.order),
            }
          : entry,
      );
      const updated = { ...schema, steps, updated_at: '2026-06-27T10:40:00Z' };
      replaceSchema(schema.id, updated);
      return json(field, { status: 201 });
    }),
    http.patch(`${API_BASE_URL}/form-schemas/:id/fields/:fieldId/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const patch = await request.json();
      let updatedField = null;
      const steps = schema.steps.map((step) => {
        const fields = step.form_fields.map((field) => {
          if (field.id !== params.fieldId) {
            return field;
          }
          updatedField = { ...field, ...patch, updated_at: '2026-06-27T10:45:00Z' };
          return updatedField;
        });
        return { ...step, form_fields: fields.sort((a, b) => a.order - b.order) };
      });

      if (!updatedField) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const updated = { ...schema, steps, updated_at: '2026-06-27T10:45:00Z' };
      replaceSchema(schema.id, updated);
      return json(updatedField);
    }),
    http.delete(`${API_BASE_URL}/form-schemas/:id/fields/:fieldId/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      let removed = false;
      const steps = schema.steps.map((step) => {
        const nextFields = step.form_fields.filter((field) => field.id !== params.fieldId);
        if (nextFields.length !== step.form_fields.length) {
          removed = true;
        }
        return { ...step, form_fields: nextFields };
      });

      if (!removed) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const updated = { ...schema, steps, updated_at: '2026-06-27T10:50:00Z' };
      replaceSchema(schema.id, updated);
      return new HttpResponse(null, { status: 204 });
    }),
    http.post(`${API_BASE_URL}/form-schemas/:id/documents/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const body = await request.json();
      const doc = {
        id: `doc-${Math.random().toString(16).slice(2, 10)}`,
        form_schema: schema.id,
        name: body.name,
        description: body.description ?? '',
        accepted_format: body.accepted_format,
        required: Boolean(body.required),
        order: body.order ?? schema.document_requirements.length + 1,
        created_at: '2026-06-27T10:55:00Z',
        updated_at: '2026-06-27T10:55:00Z',
      };

      const updated = {
        ...schema,
        document_requirements: [...schema.document_requirements, doc].sort(
          (a, b) => a.order - b.order,
        ),
        updated_at: '2026-06-27T10:55:00Z',
      };
      replaceSchema(schema.id, updated);
      return json(doc, { status: 201 });
    }),
    http.patch(
      `${API_BASE_URL}/form-schemas/:id/documents/:docId/`,
      async ({ params, request }) => {
        const unauthorized = ensureAuth(request);
        if (unauthorized) {
          return unauthorized;
        }

        const schema = getSchema(params.id);
        if (!schema) {
          return json({ detail: 'Not found' }, { status: 404 });
        }

        const patch = await request.json();
        const documents = schema.document_requirements.map((entry) =>
          entry.id === params.docId
            ? { ...entry, ...patch, updated_at: '2026-06-27T11:00:00Z' }
            : entry,
        );
        if (!documents.some((entry) => entry.id === params.docId)) {
          return json({ detail: 'Not found' }, { status: 404 });
        }

        const updated = {
          ...schema,
          document_requirements: documents.sort((a, b) => a.order - b.order),
          updated_at: '2026-06-27T11:00:00Z',
        };
        replaceSchema(schema.id, updated);
        return json(updated.document_requirements.find((entry) => entry.id === params.docId));
      },
    ),
    http.delete(`${API_BASE_URL}/form-schemas/:id/documents/:docId/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }

      const schema = getSchema(params.id);
      if (!schema) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const nextDocuments = schema.document_requirements.filter(
        (entry) => entry.id !== params.docId,
      );
      if (nextDocuments.length === schema.document_requirements.length) {
        return json({ detail: 'Not found' }, { status: 404 });
      }

      const updated = {
        ...schema,
        document_requirements: nextDocuments,
        updated_at: '2026-06-27T11:05:00Z',
      };
      replaceSchema(schema.id, updated);
      return new HttpResponse(null, { status: 204 });
    }),
    http.get(`${API_BASE_URL}/branches/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated(branches));
    }),
  ];
}

export function getHandlerSet(name) {
  switch (name) {
    case 'auth':
      return authHandlers();
    case 'auth-invalid-otp':
      return authHandlers({ invalidOtp: true });
    case 'auth-refresh-expired':
      return authHandlers({ refreshFails: true });
    case 'overview':
      return overviewHandlers();
    case 'auth-direct':
      return overviewHandlers({ directLogin: true });
    case 'products':
      return productsHandlers();
    default:
      throw new Error(`Unknown handler set: ${name}`);
  }
}

export function makeExpiredStorageState() {
  const expiredToken = makeJwt({
    sub: 'user-system-admin',
    role: 'system_admin',
    exp: Math.floor(Date.now() / 1000) - 60,
  });

  return {
    cookies: [
      {
        name: 'cente_session',
        value: JSON.stringify({ access: expiredToken, refresh: 'refresh-expired' }),
        domain: '127.0.0.1',
        path: '/',
        expires: Math.floor(Date.now() / 1000) + 60 * 5,
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
      },
    ],
    origins: [],
  };
}

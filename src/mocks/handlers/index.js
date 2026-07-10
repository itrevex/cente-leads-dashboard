import { http, HttpResponse } from 'msw';
import { URL } from 'node:url';
import { Buffer } from 'node:buffer';

import { paginated, branches } from '../fixtures/branches.js';
import { makeJwtPair, makeJwt } from '../fixtures/jwt.js';
import { overviewReport } from '../fixtures/overview.js';
import { makeProduct, makeSchema } from '../fixtures/products.js';
import { makeLead, makeStatusCounts } from '../fixtures/leads.js';
import { systemAdminUser, loanOfficerUser, branchManagerUser } from '../fixtures/users.js';
import { roles, permissions as allPermissions } from '../fixtures/roles.js';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const validPhone = '+256700000001';
const validPassword = 'Passw0rd!';
const validOtp = '123456';
const otpSessionToken = 'otp-session-001';

// Every account authHandlers() will accept a login for, keyed by phone --
// (phone, password) -> user fixture. Defaults to just the system admin
// (existing behavior); handler sets that need to log in as a different
// role (e.g. leadsHandlers()) pass their own `users` list.
const DEFAULT_CREDENTIALS = [{ phone: validPhone, password: validPassword, user: systemAdminUser }];

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

// Decodes the unsigned JWT makeJwt() produces (alg: 'none') to recover
// which user is making the request -- mirrors how a real backend resolves
// request.user from the Authorization header, so /users/me/ and other
// per-user responses reflect whoever actually logged in, not always the
// same hardcoded fixture.
function currentUserFrom(request, credentials) {
  const header = request.headers.get('authorization') ?? '';
  const token = header.replace(/^Bearer\s+/i, '');
  const payloadSegment = token.split('.')[1];
  if (!payloadSegment) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadSegment, 'base64').toString('utf8'));
    return credentials.find((entry) => entry.user.id === payload.sub)?.user ?? null;
  } catch {
    return null;
  }
}

function authHandlers({
  invalidOtp = false,
  refreshFails = false,
  directLogin = false,
  credentials = DEFAULT_CREDENTIALS,
} = {}) {
  return [
    http.post(`${API_BASE_URL}/auth/login/`, async ({ request }) => {
      const body = await request.json();
      const match = credentials.find(
        (entry) => entry.phone === body.phone && entry.password === body.password,
      );
      if (!match) {
        return json({ detail: 'Invalid credentials' }, { status: 401 });
      }
      if (directLogin) {
        return json(makeJwtPair({ sub: match.user.id, role: match.user.role }));
      }
      return json({ session_token: `${otpSessionToken}-${match.user.id}` });
    }),
    http.post(`${API_BASE_URL}/auth/otp/verify/`, async ({ request }) => {
      const body = await request.json();
      const match = credentials.find(
        (entry) => `${otpSessionToken}-${entry.user.id}` === body.session_token,
      );
      if (!match) {
        return json({ detail: 'Session not found' }, { status: 401 });
      }
      if (invalidOtp || body.code !== validOtp) {
        return json({ detail: 'Invalid code' }, { status: 401 });
      }
      return json(makeJwtPair({ sub: match.user.id, role: match.user.role }));
    }),
    http.post(`${API_BASE_URL}/auth/token/refresh/`, async ({ request }) => {
      const body = await request.json();
      const match = credentials.find((entry) => `refresh-${entry.user.id}` === body.refresh);
      if (refreshFails || !match) {
        return json({ detail: 'Token is invalid or expired' }, { status: 401 });
      }
      return json(makeJwtPair({ sub: match.user.id, role: match.user.role }));
    }),
    http.get(`${API_BASE_URL}/users/me/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(currentUserFrom(request, credentials) ?? systemAdminUser);
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
    // The Topbar's NotificationBell (src/domains/notifications/NotificationBell.tsx)
    // fetches this on mount on every authenticated page via the same-origin
    // /api/notifications/ proxy -- present on every page these handler sets
    // render, so it belongs in the shared authHandlers(), not a per-scenario set.
    http.get(`${API_BASE_URL}/notifications/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated([]));
    }),
    http.post(`${API_BASE_URL}/notifications/:id/mark-read/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return new HttpResponse(null, { status: 204 });
    }),
    http.post(`${API_BASE_URL}/notifications/mark-all-read/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return new HttpResponse(null, { status: 204 });
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

// ADR-0034 tiered-decline scenario: a lead in `review`, testable as both
// Loan Officer (can Recommend / Recommend Decline, not Decline) and Branch
// Manager (can Recommend / Decline directly), plus the Users & Roles "Last
// activity" column reading last_active_at. Both accounts log in directly
// (no OTP step) to keep the tests focused on the leads/users UI, not the
// auth flow already covered by auth.spec.ts/auth-direct.spec.ts.
function leadsHandlers() {
  const credentials = [
    { phone: loanOfficerUser.phone, password: 'Passw0rd!', user: loanOfficerUser },
    { phone: branchManagerUser.phone, password: 'Passw0rd!', user: branchManagerUser },
    { phone: systemAdminUser.phone, password: validPassword, user: systemAdminUser },
  ];

  const leads = [
    makeLead(),
    makeLead({
      id: 'lead-002',
      applicant_name: 'Rebecca Auma',
      applicant_phone: '+256770000021',
      applicant_nin: 'CM87654321',
    }),
    makeLead({
      id: 'lead-003',
      applicant_name: 'Grace Atim',
      applicant_phone: '+256770000022',
      applicant_nin: 'CM11223344',
    }),
  ];

  function findLead(id) {
    return leads.find((lead) => lead.id === id) ?? null;
  }

  function decide(id, nextStatus, extra = {}) {
    const lead = findLead(id);
    if (!lead) return null;
    Object.assign(lead, { status: nextStatus, ...extra });
    return lead;
  }

  return [
    ...authHandlers({ directLogin: true, credentials }),
    // Login hard-navigates to '/' (Overview) before any test can move on to
    // /leads/mine (src/domains/auth/components/LoginForm.tsx).
    http.get(`${API_BASE_URL}/reports/overview/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(overviewReport);
    }),
    http.get(`${API_BASE_URL}/leads/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated(leads));
    }),
    http.get(`${API_BASE_URL}/leads/status-counts/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const activeCount = leads.filter(
        (lead) => lead.status !== 'recommended' && lead.status !== 'declined',
      ).length;
      return json(
        makeStatusCounts({
          all: activeCount,
          by_status: {
            draft: 0,
            chair_pending: 0,
            review: leads.filter((lead) => lead.status === 'review').length,
            info_requested: 0,
            returned: 0,
            decline_recommended: leads.filter((lead) => lead.status === 'decline_recommended')
              .length,
            recommended: leads.filter((lead) => lead.status === 'recommended').length,
            declined: leads.filter((lead) => lead.status === 'declined').length,
          },
        }),
      );
    }),
    // Registered before the generic /leads/:id/ handler below -- MSW
    // matches path handlers in registration order, and `:id` would
    // otherwise swallow this literal path first (id="reassign-candidates"
    // -> 404, silently emptying the Reassign modal's dropdowns).
    http.get(`${API_BASE_URL}/leads/reassign-candidates/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json({
        agents: [{ id: 'user-agent-001', full_name: 'Demo Agent', role: 'agent' }],
        reviewing_officers: [
          { id: loanOfficerUser.id, full_name: loanOfficerUser.full_name, role: 'loan_officer' },
          {
            id: branchManagerUser.id,
            full_name: branchManagerUser.full_name,
            role: 'branch_manager',
          },
        ],
      });
    }),
    http.get(`${API_BASE_URL}/leads/:id/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const lead = findLead(params.id);
      if (!lead) {
        return json({ detail: 'Not found.' }, { status: 404 });
      }
      return json(lead);
    }),
    http.get(`${API_BASE_URL}/loan-products/:id/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(makeProduct({ id: params.id }));
    }),
    http.get(`${API_BASE_URL}/form-schemas/:id/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(makeSchema({ id: params.id }));
    }),
    http.get(`${API_BASE_URL}/leads/:id/chair-approvals/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated([]));
    }),
    http.get(`${API_BASE_URL}/leads/:id/comments/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated([]));
    }),
    http.get(`${API_BASE_URL}/leads/:id/documents/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated([]));
    }),
    http.get(`${API_BASE_URL}/leads/:id/gps-pins/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated([]));
    }),
    http.get(`${API_BASE_URL}/leads/:id/audit-events/`, ({ request, params }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      // Lead-scoped timeline is gated on view_leads, not the global
      // view_audit permission, so any role that can open the lead (loan
      // officer, branch manager) can see its history.
      return json(
        paginated([
          {
            id: 'audit-1',
            actor_user: null,
            actor_user_name: 'Mbazira Alfred',
            actor_role: 'loan_officer',
            entity_type: 'lead',
            entity_id: params.id,
            entity_label: null,
            subject: `lead:${params.id}`,
            action: 'lead.decline_recommended',
            from_state: 'review',
            to_state: 'decline_recommended',
            reason: 'Insufficient collateral documentation.',
            payload: {},
            occurred_at: '2026-07-09T10:00:00Z',
            source_surface: 'dashboard',
            ip_address: null,
            device_label: null,
          },
        ]),
      );
    }),
    http.get(`${API_BASE_URL}/branches/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated(branches));
    }),
    http.get(`${API_BASE_URL}/cooperatives/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated([{ id: 'coop-001', name: 'Tukolere Wamu SACCO' }]));
    }),
    http.get(`${API_BASE_URL}/agents/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated([{ id: 'user-agent-001', full_name: 'Demo Agent' }]));
    }),
    http.get(`${API_BASE_URL}/users/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      // Neither loan_officer nor branch_manager holds view_users, so the
      // reviewing-officer options dropdown degrades to empty, same as real
      // apps.roles' ADR-0009 permission gate.
      return json({ detail: 'Forbidden.' }, { status: 403 });
    }),
    http.post(`${API_BASE_URL}/leads/:id/recommend/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const lead = decide(params.id, 'recommended', { decided_at: '2026-07-08T10:00:00Z' });
      if (!lead) return json({ detail: 'Not found.' }, { status: 404 });
      return json(lead);
    }),
    http.post(`${API_BASE_URL}/leads/:id/decline/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const user = currentUserFrom(request, credentials);
      if (user?.id !== branchManagerUser.id) {
        return json(
          { detail: 'You do not have permission to perform this action.' },
          {
            status: 403,
          },
        );
      }
      const body = await request.json();
      const lead = decide(params.id, 'declined', {
        decline_reason: body.reason,
        decided_at: '2026-07-08T10:00:00Z',
      });
      if (!lead) return json({ detail: 'Not found.' }, { status: 404 });
      return json(lead);
    }),
    http.post(`${API_BASE_URL}/leads/:id/recommend-decline/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const user = currentUserFrom(request, credentials);
      if (user?.id !== loanOfficerUser.id) {
        return json(
          { detail: 'You do not have permission to perform this action.' },
          {
            status: 403,
          },
        );
      }
      const lead = decide(params.id, 'decline_recommended');
      if (!lead) return json({ detail: 'Not found.' }, { status: 404 });
      return json(lead);
    }),
    http.post(`${API_BASE_URL}/leads/:id/request-info/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const body = await request.json();
      const lead = decide(params.id, 'info_requested', { info_requested_reason: body.reason });
      if (!lead) return json({ detail: 'Not found.' }, { status: 404 });
      return json(lead);
    }),
    http.post(`${API_BASE_URL}/leads/:id/return-to-agent/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const lead = decide(params.id, 'returned');
      if (!lead) return json({ detail: 'Not found.' }, { status: 404 });
      return json(lead);
    }),
    http.post(`${API_BASE_URL}/leads/:id/reassign/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const body = await request.json();
      const reassignCandidates = [loanOfficerUser, branchManagerUser];
      const extra = {};
      if (body.agent_id !== undefined) {
        extra.assigned_agent = body.agent_id;
        extra.assigned_agent_name = 'Demo Agent';
      }
      if (body.reviewing_officer_id !== undefined) {
        extra.reviewing_officer = body.reviewing_officer_id;
        extra.reviewing_officer_name =
          reassignCandidates.find((entry) => entry.id === body.reviewing_officer_id)?.full_name ??
          null;
      }
      const lead = decide(params.id, findLead(params.id)?.status, extra);
      if (!lead) return json({ detail: 'Not found.' }, { status: 404 });
      return json(lead);
    }),
  ];
}

// Users & Roles: system admin sees the Loan Officer's real last_active_at
// (ADR-0009 follow-up) instead of the pre-existing last_login, which only
// updates once per 30-day refresh-token lifetime.
function usersHandlers() {
  // 11 filler users beyond the 3 real fixtures push past UsersTab's
  // PAGE_SIZE (10), exercising the Pagination component's Next/Prev.
  const fillerUsers = Array.from({ length: 11 }, (_, index) => ({
    id: `user-filler-${index + 1}`,
    email: `filler${index + 1}@cente.test`,
    phone: `+25670000${(index + 10).toString().padStart(2, '0')}`,
    full_name: `Filler User ${index + 1}`,
    role: 'loan_officer',
    branch: 'branch-kampala',
    branch_name: 'Kampala Main',
    status: 'active',
    last_login: null,
    last_active_at: null,
    permissions: ['view_leads'],
    can_be_reviewing_officer: true,
  }));
  const users = [systemAdminUser, loanOfficerUser, branchManagerUser, ...fillerUsers];
  const rolesState = roles.map((role) => ({ ...role, permissions: [...role.permissions] }));

  function findRole(id) {
    return rolesState.find((role) => role.id === id) ?? null;
  }

  return [
    ...authHandlers({ directLogin: true }),
    // Login hard-navigates to '/' (Overview) before any test can move on to
    // /users (src/domains/auth/components/LoginForm.tsx).
    http.get(`${API_BASE_URL}/reports/overview/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(overviewReport);
    }),
    http.get(`${API_BASE_URL}/users/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated(users));
    }),
    http.post(`${API_BASE_URL}/users/`, async ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const body = await request.json();
      const user = {
        id: `user-${users.length + 1}`,
        email: body.email,
        phone: body.phone,
        full_name: body.full_name,
        role: body.role,
        branch: body.branch ?? null,
        branch_name: branches.find((b) => b.id === body.branch)?.name ?? null,
        status: 'active',
        last_login: null,
        last_active_at: null,
        permissions: [],
        can_be_reviewing_officer: false,
      };
      users.push(user);
      return json(user, { status: 201 });
    }),
    http.patch(`${API_BASE_URL}/users/:id/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const user = users.find((entry) => entry.id === params.id);
      if (!user) return json({ detail: 'Not found.' }, { status: 404 });
      const body = await request.json();
      Object.assign(user, {
        full_name: body.full_name ?? user.full_name,
        email: body.email ?? user.email,
        phone: body.phone ?? user.phone,
        role: body.role ?? user.role,
        branch: body.branch ?? user.branch,
      });
      return json(user);
    }),
    http.post(`${API_BASE_URL}/users/:id/suspend/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const user = users.find((entry) => entry.id === params.id);
      if (!user) return json({ detail: 'Not found.' }, { status: 404 });
      user.status = 'disabled';
      return json(user);
    }),
    http.post(`${API_BASE_URL}/users/:id/reactivate/`, ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const user = users.find((entry) => entry.id === params.id);
      if (!user) return json({ detail: 'Not found.' }, { status: 404 });
      user.status = 'active';
      return json(user);
    }),
    http.get(`${API_BASE_URL}/roles/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated(rolesState));
    }),
    http.post(`${API_BASE_URL}/roles/`, async ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const body = await request.json();
      const role = {
        id: `role-${rolesState.length + 1}`,
        key: body.key,
        name: body.name,
        description: body.description ?? '',
        is_builtin: false,
        permissions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      rolesState.push(role);
      return json(role, { status: 201 });
    }),
    http.put(`${API_BASE_URL}/roles/:id/permissions/`, async ({ params, request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      const role = findRole(params.id);
      if (!role) {
        return json({ detail: 'Not found.' }, { status: 404 });
      }
      const body = await request.json();
      role.permissions = body.permission_keys.map((key) => {
        const permission = allPermissions.find((entry) => entry.key === key);
        return { id: `grant-${key}`, key, name: permission?.name ?? key };
      });
      return json(role.permissions);
    }),
    http.get(`${API_BASE_URL}/permissions/`, ({ request }) => {
      const unauthorized = ensureAuth(request);
      if (unauthorized) {
        return unauthorized;
      }
      return json(paginated(allPermissions));
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
    case 'leads':
      return leadsHandlers();
    case 'users':
      return usersHandlers();
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

import { createProxyHandler } from '../../../shared/products-proxy';

const handler = createProxyHandler('audit-events');

export const GET = handler;

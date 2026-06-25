import type { APIRoute } from 'astro';
import { createProxyHandler } from '../../../shared/products-proxy';

const handler: APIRoute = createProxyHandler('form-schemas');

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;

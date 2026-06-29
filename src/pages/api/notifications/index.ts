import type { APIRoute } from 'astro';
import { createProxyHandler } from '../../../shared/products-proxy';

const handler: APIRoute = createProxyHandler('notifications');

export const GET = handler;
export const POST = handler;

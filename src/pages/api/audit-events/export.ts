import { createExportProxyHandler } from '../../../shared/export-proxy';

export const GET = createExportProxyHandler('audit-events/export/', 'audit-log.csv');

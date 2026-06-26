import { createExportProxyHandler } from '../../../../shared/export-proxy';

export const GET = createExportProxyHandler('reports/funnel/export/', 'report-funnel.csv');

import { createExportProxyHandler } from '../../../../shared/export-proxy';

export const GET = createExportProxyHandler(
  'reports/cooperative-health/export.pdf',
  'report-cooperative-health.pdf',
);

import { createExportProxyHandler } from '../../../../shared/export-proxy';

export const GET = createExportProxyHandler(
  'reports/cooperative-health/export/',
  'report-cooperative-health.csv',
);

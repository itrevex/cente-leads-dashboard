import { createExportProxyHandler } from '../../../../shared/export-proxy';

export const GET = createExportProxyHandler(
  'reports/return-reasons/export/',
  'report-return-reasons.csv',
);

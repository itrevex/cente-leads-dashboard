import { createExportProxyHandler } from '../../../../shared/export-proxy';

export const GET = createExportProxyHandler(
  'reports/return-reasons/export.pdf',
  'report-return-reasons.pdf',
);

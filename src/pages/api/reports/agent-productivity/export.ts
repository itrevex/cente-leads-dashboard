import { createExportProxyHandler } from '../../../../shared/export-proxy';

export const GET = createExportProxyHandler(
  'reports/agent-productivity/export/',
  'report-agent-productivity.csv',
);

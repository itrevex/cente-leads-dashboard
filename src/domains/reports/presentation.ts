import type { ReportTab } from './types';

export const REPORT_TAB_LABELS: Record<ReportTab, string> = {
  funnel: 'Lead Funnel',
  returns: 'Return Reasons',
  agent: 'Agent Productivity',
  coop: 'Cooperative Health',
};

export const REPORT_TABS: ReportTab[] = ['funnel', 'returns', 'agent', 'coop'];

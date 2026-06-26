import type {
  LeadFunnelReport,
  ReturnReasonsReport,
  AgentProductivityReport,
  CooperativeHealthReport,
  ReportTab,
  DateRange,
} from './types';

export class ReportsApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Reports API request failed with status ${status}`);
  }
}

const ENDPOINT_BY_TAB: Record<ReportTab, string> = {
  funnel: 'funnel',
  returns: 'return-reasons',
  agent: 'agent-productivity',
  coop: 'cooperative-health',
};

function buildQuery(range: DateRange): string {
  const params = new URLSearchParams();
  if (range.from) params.set('from', range.from);
  if (range.to) params.set('to', range.to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function fetchReport<T>(tab: ReportTab, range: DateRange): Promise<T> {
  const response = await fetch(`/api/reports/${ENDPOINT_BY_TAB[tab]}${buildQuery(range)}`);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ReportsApiError(response.status, body);
  }
  return body as T;
}

export function fetchFunnelReport(range: DateRange): Promise<LeadFunnelReport> {
  return fetchReport<LeadFunnelReport>('funnel', range);
}

export function fetchReturnReasonsReport(range: DateRange): Promise<ReturnReasonsReport> {
  return fetchReport<ReturnReasonsReport>('returns', range);
}

export function fetchAgentProductivityReport(range: DateRange): Promise<AgentProductivityReport> {
  return fetchReport<AgentProductivityReport>('agent', range);
}

export function fetchCooperativeHealthReport(range: DateRange): Promise<CooperativeHealthReport> {
  return fetchReport<CooperativeHealthReport>('coop', range);
}

export function exportUrl(tab: ReportTab, range: DateRange, format: 'csv' | 'pdf'): string {
  const query = buildQuery(range);
  const path = `/api/reports/${ENDPOINT_BY_TAB[tab]}/export${format === 'pdf' ? '.pdf' : ''}`;
  return `${path}${query}`;
}

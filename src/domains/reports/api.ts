import { request } from '../../shared/api-client';
import type {
  LeadFunnelReport,
  ReturnReasonsReport,
  AgentProductivityReport,
  CooperativeHealthReport,
} from './types';

export function getLeadFunnelReport(accessToken: string): Promise<LeadFunnelReport> {
  return request<LeadFunnelReport>('/reports/funnel/', { method: 'GET' }, accessToken);
}

export function getReturnReasonsReport(accessToken: string): Promise<ReturnReasonsReport> {
  return request<ReturnReasonsReport>('/reports/return-reasons/', { method: 'GET' }, accessToken);
}

export function getAgentProductivityReport(accessToken: string): Promise<AgentProductivityReport> {
  return request<AgentProductivityReport>(
    '/reports/agent-productivity/',
    { method: 'GET' },
    accessToken,
  );
}

export function getCooperativeHealthReport(accessToken: string): Promise<CooperativeHealthReport> {
  return request<CooperativeHealthReport>(
    '/reports/cooperative-health/',
    { method: 'GET' },
    accessToken,
  );
}

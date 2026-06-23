import { request } from '../../shared/api-client';
import type { OverviewReport } from './types';

export function getOverviewReport(accessToken: string): Promise<OverviewReport> {
  return request<OverviewReport>('/reports/overview/', { method: 'GET' }, accessToken);
}

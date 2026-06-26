export interface FunnelStage {
  stage: string;
  count: number;
  pct_of_captured: number;
}

export interface LeadFunnelReport {
  captured: number;
  recommended: number;
  decided: number;
  stages: FunnelStage[];
}

export interface ReturnReasonCount {
  reason: string;
  count: number;
}

export interface ReturnReasonsReport {
  returned_total: number;
  resubmitted: number;
  lost_after_return: number;
  reasons: ReturnReasonCount[];
}

export interface AgentProductivityRow {
  agent_id: string;
  agent_name: string;
  leads_total: number;
  chair_approval_rate_pct: number;
  recommend_rate_pct: number;
}

export interface AgentProductivityReport {
  agents: AgentProductivityRow[];
}

export interface CooperativeHealthRow {
  cooperative_id: string;
  cooperative_name: string;
  active_leads: number;
  median_chair_latency_minutes: number | null;
}

export interface CooperativeHealthReport {
  cooperatives: CooperativeHealthRow[];
}

export type ReportTab = 'funnel' | 'returns' | 'agent' | 'coop';

export interface DateRange {
  from?: string;
  to?: string;
}

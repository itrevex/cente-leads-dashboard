export interface RecentActivityItem {
  id: string;
  applicant_name: string;
  applicant_nin: string;
  initiation_channel: 'agent' | 'branch';
  cooperative_name: string | null;
  branch_name: string;
  amount_requested: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface OverviewReport {
  total_in_pipeline: number;
  bank_reviewing: number;
  stuck_at_chair_approval: number;
  returned_to_agent: number;
  by_status: Record<string, number>;
  recent_activity: RecentActivityItem[];
}

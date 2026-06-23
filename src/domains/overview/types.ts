export interface OverviewReport {
  total_in_pipeline: number;
  bank_reviewing: number;
  stuck_at_chair_approval: number;
  returned_to_agent: number;
  by_status: Record<string, number>;
}

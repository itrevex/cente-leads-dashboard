import type { BranchRegion } from './types';

export const REGION_LABELS: Record<BranchRegion, string> = {
  central: 'Central',
  eastern: 'Eastern',
  northern: 'Northern',
  western: 'Western',
};

export const BRANCH_REGIONS: BranchRegion[] = ['central', 'eastern', 'northern', 'western'];

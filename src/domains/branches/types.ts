export type BranchRegion = 'central' | 'eastern' | 'northern' | 'western';

export type BranchStatus = 'active' | 'inactive';

export interface Branch {
  id: string;
  name: string;
  code: string;
  region: BranchRegion | '';
  district: string;
  phone: string;
  is_hq: boolean;
  status: BranchStatus;
  applications_mtd: number;
  officers_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type AgentStatus = 'active' | 'disabled';

export interface AgentBranch {
  id: string;
  name: string;
  code: string;
}

export interface AgentCooperative {
  id: string;
  name: string;
}

export interface Agent {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: AgentStatus;
  branches: AgentBranch[];
  cooperatives: AgentCooperative[];
  created_at: string;
  updated_at: string;
}

export interface BranchOption {
  id: string;
  name: string;
}

export interface CooperativeOption {
  id: string;
  name: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

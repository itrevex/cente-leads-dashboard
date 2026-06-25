import type { DashboardRole, UserStatus, PermissionKey } from '../../shared/types';

export interface DashboardUser {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: DashboardRole;
  branch: string | null;
  branch_name: string | null;
  status: UserStatus;
  permissions: PermissionKey[];
  can_be_reviewing_officer: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermissionGrant {
  id: string;
  key: PermissionKey;
  name: string;
}

export interface Role {
  id: string;
  key: string;
  name: string;
  description: string;
  is_builtin: boolean;
  permissions: RolePermissionGrant[];
  created_at: string;
  updated_at: string;
}

export interface DashboardPermission {
  id: string;
  key: PermissionKey;
  name: string;
  description: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchOption {
  id: string;
  name: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

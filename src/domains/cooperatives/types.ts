export type CooperativeType =
  | 'sacco'
  | 'farmers_group'
  | 'traders_group'
  | 'cooperative'
  | 'association'
  | 'dealership'
  | 'partner';

export type CooperativeStatus = 'active' | 'suspended';

export interface CooperativeBranch {
  id: string;
  name: string;
  code: string;
}

export interface Cooperative {
  id: string;
  name: string;
  registration_number: string;
  type: CooperativeType;
  status: CooperativeStatus;
  district: string;
  branches: string[];
  chairperson: string | null;
  secretary: string | null;
  contact_phone: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

export type MemberGender = 'male' | 'female' | 'other' | '';
export type MemberKycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type MemberStatus = 'active' | 'inactive';

export interface CooperativeMember {
  id: string;
  cooperative: string;
  national_id: string;
  full_name: string;
  phone: string;
  date_of_birth: string | null;
  gender: MemberGender;
  member_number: string;
  date_joined_cooperative: string;
  shares_held: number;
  kyc_status: MemberKycStatus;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
}

export interface BranchOption {
  id: string;
  name: string;
}

export interface UserOption {
  id: string;
  full_name: string;
  phone: string;
  email: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

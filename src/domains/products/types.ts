export type LoanProductSegment = 'salary' | 'business' | 'agriculture' | 'asset_finance';

export interface LoanProduct {
  id: string;
  code: string;
  name: string;
  segment: LoanProductSegment;
  description: string;
  min_amount: number;
  max_amount: number;
  currency: string;
  interest_rate_bps: number;
  processing_fee_bps: number;
  min_term_months: number;
  max_term_months: number;
  requires_chair_approval: boolean;
  active_form_schema: string | null;
  branch_availability: string[];
  is_active: boolean;
  applications_mtd: number;
  approval_rate: number | null;
  created_at: string;
  updated_at: string;
}

export type FormSchemaStatus = 'draft' | 'published' | 'retired';

export type StepPerformerRole =
  | 'branch_officer'
  | 'branch_manager'
  | 'loan_officer'
  | 'head_of_loans'
  | 'compliance_officer'
  | 'system_automatic';

export type StepIcon =
  | 'user'
  | 'briefcase'
  | 'cash'
  | 'shield'
  | 'document'
  | 'check_circle'
  | 'clock'
  | 'flag'
  | 'home'
  | 'alert';

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'dropdown'
  | 'phone'
  | 'id'
  | 'file_upload'
  | 'signature';

export type DocumentAcceptedFormat =
  | 'pdf_only'
  | 'image_jpg_png'
  | 'image_or_pdf'
  | 'pdf_or_excel'
  | 'any_format';

export interface FieldOption {
  value: string;
  label: string;
}

export interface LeadFormFieldNested {
  id: string;
  key: string;
  label: string;
  field_type: FormFieldType;
  required: boolean;
  order: number;
  options: FieldOption[] | null;
}

export interface LeadFormStep {
  id: string;
  form_schema: string;
  name: string;
  description: string;
  performed_by: StepPerformerRole;
  sla_hours: number;
  icon: StepIcon;
  required: boolean;
  order: number;
  form_fields: LeadFormFieldNested[];
  created_at: string;
  updated_at: string;
}

export interface LeadFormField {
  id: string;
  form_schema: string;
  step: string;
  key: string;
  label: string;
  field_type: FormFieldType;
  required: boolean;
  order: number;
  options: FieldOption[] | null;
  created_at: string;
  updated_at: string;
}

export interface LeadFormDocumentRequirement {
  id: string;
  form_schema: string;
  name: string;
  description: string;
  accepted_format: DocumentAcceptedFormat;
  required: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface LeadFormGpsRequirement {
  id: string;
  form_schema: string;
  label: string;
  required: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface LeadFormSchema {
  id: string;
  loan_product: string;
  version: number;
  status: FormSchemaStatus;
  published_at: string | null;
  retired_at: string | null;
  created_by: string;
  steps: LeadFormStep[];
  document_requirements: LeadFormDocumentRequirement[];
  gps_requirements: LeadFormGpsRequirement[];
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

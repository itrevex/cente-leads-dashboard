export { formatUgx } from '../../shared/lead-presentation';

import type {
  LoanProductSegment,
  FormSchemaStatus,
  StepPerformerRole,
  FormFieldType,
  DocumentAcceptedFormat,
} from './types';

export const SEGMENT_LABELS: Record<LoanProductSegment, string> = {
  salary: 'Salary',
  business: 'Business',
  agriculture: 'Agriculture',
  asset_finance: 'Asset Finance',
};

export const SCHEMA_STATUS_META: Record<
  FormSchemaStatus,
  { label: string; color: 'neutral' | 'yellow' | 'green' }
> = {
  draft: { label: 'Draft', color: 'yellow' },
  published: { label: 'Published', color: 'green' },
  retired: { label: 'Retired', color: 'neutral' },
};

export const STEP_PERFORMER_LABELS: Record<StepPerformerRole, string> = {
  branch_officer: 'Branch Officer',
  branch_manager: 'Branch Manager',
  loan_officer: 'Loan Officer',
  head_of_loans: 'Head of Loans',
  compliance_officer: 'Compliance Officer',
  system_automatic: 'System (automatic)',
};

export const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text: 'Text',
  textarea: 'Long text',
  number: 'Number',
  currency: 'Currency',
  date: 'Date',
  dropdown: 'Dropdown',
  phone: 'Phone',
  id: 'National ID',
  file_upload: 'File upload',
  signature: 'Signature',
};

export const DOCUMENT_FORMAT_LABELS: Record<DocumentAcceptedFormat, string> = {
  pdf_only: 'PDF only',
  image_jpg_png: 'Image (JPG/PNG)',
  image_or_pdf: 'Image or PDF',
  pdf_or_excel: 'PDF or Excel',
  any_format: 'Any format',
};

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

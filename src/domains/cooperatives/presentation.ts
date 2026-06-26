import type { CooperativeType } from './types';

export const COOPERATIVE_TYPE_LABELS: Record<CooperativeType, string> = {
  sacco: 'SACCO',
  farmers_group: 'Farmers Group',
  traders_group: 'Traders Group',
  cooperative: 'Cooperative',
  association: 'Association',
  dealership: 'Dealership',
  partner: 'Partner',
};

export const COOPERATIVE_TYPES: CooperativeType[] = [
  'sacco',
  'farmers_group',
  'traders_group',
  'cooperative',
  'association',
  'dealership',
  'partner',
];

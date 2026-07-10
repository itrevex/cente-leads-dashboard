import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CooperativeMembersPage from './CooperativeMembersPage';
import type { Cooperative, CooperativeMember } from '../types';

let membersResponse: CooperativeMember[] = [];

vi.mock('../client', () => ({
  listCooperativeMembers: () =>
    Promise.resolve({ results: membersResponse, count: membersResponse.length }),
  CooperativesApiError: class CooperativesApiError extends Error {},
}));

const cooperative: Cooperative = {
  id: 'coop-1',
  name: "Kabonera Coffee Farmers' Cooperative",
  registration_number: 'REG-001',
  type: 'farmers_group',
  status: 'active',
  district: 'Masaka',
  branches: ['branch-1'],
  chairperson: 'user-chair-1',
  secretary: 'user-secretary-1',
  chairperson_detail: {
    id: 'user-chair-1',
    full_name: 'Demo Chairperson',
    phone: '+256700000030',
    leader_approval_status: 'approved',
  },
  secretary_detail: {
    id: 'user-secretary-1',
    full_name: 'Demo Secretary',
    phone: '+256700000031',
    leader_approval_status: 'approved',
  },
  contact_phone: '+256700000000',
  contact_email: '',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
};

const member: CooperativeMember = {
  id: 'member-1',
  cooperative: 'coop-1',
  national_id: 'CM12345',
  full_name: 'New Farmer',
  phone: '+256700111000',
  date_of_birth: null,
  gender: '',
  member_number: 'AUTO-001',
  date_joined_cooperative: '2026-07-09',
  shares_held: 0,
  kyc_status: 'unverified',
  status: 'active',
  created_at: '2026-07-09T00:00:00Z',
  updated_at: '2026-07-09T00:00:00Z',
};

describe('CooperativeMembersPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the chairperson and secretary alongside regular members', async () => {
    membersResponse = [member];
    render(<CooperativeMembersPage cooperative={cooperative} initialMembers={[member]} />);

    await waitFor(() => expect(screen.getByText('New Farmer')).toBeTruthy());
    expect(screen.getByText('Demo Chairperson')).toBeTruthy();
    expect(screen.getByText('Chairperson')).toBeTruthy();
    expect(screen.getByText('Demo Secretary')).toBeTruthy();
    expect(screen.getByText('Secretary')).toBeTruthy();
  });

  it('does not show "No members found" when only leadership is present', async () => {
    membersResponse = [];
    render(<CooperativeMembersPage cooperative={cooperative} initialMembers={[]} />);

    await waitFor(() => expect(screen.getByText('Demo Chairperson')).toBeTruthy());
    expect(screen.queryByText('No members found.')).toBeNull();
  });

  it('shows "No members found" when there is no leadership and no members', async () => {
    membersResponse = [];
    const noLeadership: Cooperative = {
      ...cooperative,
      chairperson_detail: null,
      secretary_detail: null,
    };
    render(<CooperativeMembersPage cooperative={noLeadership} initialMembers={[]} />);

    await waitFor(() => expect(screen.getByText('No members found.')).toBeTruthy());
  });
});

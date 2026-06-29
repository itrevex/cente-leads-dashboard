import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrendingUp } from 'lucide-react';

import KpiCard from './KpiCard';

describe('KpiCard', () => {
  it('renders label, value and caption', () => {
    render(<KpiCard label="Leads" icon={TrendingUp} value={42} caption="this month" />);
    expect(screen.getByText('Leads')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('this month')).toBeTruthy();
  });

  it('applies brand styling when brand prop is true', () => {
    const { container } = render(
      <KpiCard label="Total" icon={TrendingUp} value={99} caption="all time" brand />,
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('border-cente-blue-600');
  });

  it('applies default styling when brand prop is false', () => {
    const { container } = render(
      <KpiCard label="Total" icon={TrendingUp} value={99} caption="all time" />,
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain('border-ink-100');
  });
});

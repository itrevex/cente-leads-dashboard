import { describe, expect, it } from 'vitest';
import { navForRole, withNavCounts } from './nav';

function flatIds(role: Parameters<typeof navForRole>[0]): string[] {
  return navForRole(role).flatMap((section) => section.items.map((item) => item.id));
}

describe('navForRole', () => {
  it('gives head_of_loans every nav item', () => {
    expect(flatIds('head_of_loans')).toEqual(
      expect.arrayContaining([
        'overview',
        'leads',
        'queue-mine',
        'branches',
        'cooperatives',
        'agents',
        'products',
        'users',
        'reports',
        'audit',
      ]),
    );
  });

  it('restricts branch_officer to their own workspace', () => {
    expect(flatIds('branch_officer')).toEqual(['overview', 'leads', 'queue-mine']);
  });

  it('omits a section entirely when no items in it are allowed', () => {
    const sections = navForRole('branch_officer');
    expect(sections.find((section) => section.label === 'Configuration')).toBeUndefined();
  });

  it('falls back to no nav items for an unmapped role', () => {
    // @ts-expect-error - deliberately testing an out-of-union value
    expect(navForRole('unknown_role')).toEqual([]);
  });
});

describe('withNavCounts', () => {
  it('attaches counts only to items present in the map', () => {
    const sections = navForRole('branch_officer');
    const withCounts = withNavCounts(sections, { leads: 19, 'queue-mine': 1 });
    const byId = Object.fromEntries(
      withCounts.flatMap((section) => section.items).map((item) => [item.id, item.count]),
    );
    expect(byId.leads).toBe(19);
    expect(byId['queue-mine']).toBe(1);
    expect(byId.overview).toBeUndefined();
  });
});

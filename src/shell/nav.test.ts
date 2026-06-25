import { describe, expect, it } from 'vitest';
import { navForPermissions, withNavCounts } from './nav';

function flatIds(permissions: string[]): string[] {
  return navForPermissions(permissions).flatMap((section) => section.items.map((item) => item.id));
}

describe('navForPermissions', () => {
  it('gives a fully-permissioned user every nav item', () => {
    expect(
      flatIds([
        'view_leads',
        'view_branches',
        'view_cooperatives',
        'view_agents',
        'view_products',
        'view_users',
        'view_reports',
        'view_audit',
      ]),
    ).toEqual(
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

  it('restricts a view_leads-only user to their own workspace', () => {
    expect(flatIds(['view_leads'])).toEqual(['overview', 'leads', 'queue-mine']);
  });

  it('omits a section entirely when no items in it are allowed', () => {
    const sections = navForPermissions(['view_leads']);
    expect(sections.find((section) => section.label === 'Configuration')).toBeUndefined();
  });

  it('always shows overview, which requires no permission', () => {
    expect(flatIds([])).toEqual(['overview']);
  });
});

describe('withNavCounts', () => {
  it('attaches counts only to items present in the map', () => {
    const sections = navForPermissions(['view_leads']);
    const withCounts = withNavCounts(sections, { leads: 19, 'queue-mine': 1 });
    const byId = Object.fromEntries(
      withCounts.flatMap((section) => section.items).map((item) => [item.id, item.count]),
    );
    expect(byId.leads).toBe(19);
    expect(byId['queue-mine']).toBe(1);
    expect(byId.overview).toBeUndefined();
  });
});

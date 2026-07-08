import { describe, expect, it } from 'vitest';

import {
  activeCount,
  chairpersonPendingReviewHref,
  clearChairpersonHref,
  formatUgx,
  initialsOf,
} from './lead-presentation';

describe('lead-presentation helpers', () => {
  it('formats UGX values from minor units', () => {
    expect(formatUgx(123456700)).toBe('UGX 1,234,567');
  });

  it('subtracts recommended and declined counts from the active pipeline total', () => {
    expect(activeCount({ recommended: 3, declined: 2, review: 8 }, 20)).toBe(15);
  });

  it('treats missing terminal counts as zero', () => {
    expect(activeCount({ review: 8 }, 20)).toBe(20);
  });

  it('handles only one terminal status being present', () => {
    expect(activeCount({ recommended: 4 }, 20)).toBe(16);
    expect(activeCount({ declined: 5 }, 20)).toBe(15);
  });

  it('falls back to zero when terminal counts are nullish', () => {
    expect(
      activeCount(
        { recommended: null, declined: undefined } as unknown as Record<string, number>,
        20,
      ),
    ).toBe(20);
  });

  it('builds initials from the first two non-empty name parts', () => {
    expect(initialsOf('  Sarah   Achieng Okello ')).toBe('SA');
  });

  it('returns sensible initials for short or empty names', () => {
    expect(initialsOf('Madonna')).toBe('M');
    expect(initialsOf('   ')).toBe('');
  });

  it('builds a chairperson-pending-review link scoped to chair_pending', () => {
    expect(chairpersonPendingReviewHref('user-123')).toBe(
      '/leads?chairperson=user-123&status=chair_pending',
    );
  });

  it('clears only the chairperson and page params, keeping other filters', () => {
    const params = new URLSearchParams(
      'chairperson=user-123&status=chair_pending&branch=b1&page=3',
    );
    const href = clearChairpersonHref('/leads', params);
    const [path, query] = href.split('?');
    const result = new URLSearchParams(query);

    expect(path).toBe('/leads');
    expect(result.has('chairperson')).toBe(false);
    expect(result.has('page')).toBe(false);
    expect(result.get('status')).toBe('chair_pending');
    expect(result.get('branch')).toBe('b1');
  });

  it('returns the bare base path when clearing chairperson leaves no other filters', () => {
    const params = new URLSearchParams('chairperson=user-123&page=2');
    expect(clearChairpersonHref('/leads/mine', params)).toBe('/leads/mine');
  });
});

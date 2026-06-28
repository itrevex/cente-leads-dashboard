import { describe, expect, it, vi } from 'vitest';

import { applyReorder, computeReorder } from './reorder';

describe('reorder helpers', () => {
  it('returns an empty plan when drag targets are invalid or unchanged', () => {
    const items = [
      { id: 'a', order: 1 },
      { id: 'b', order: 2 },
    ];

    expect(computeReorder(items, 'missing', 'b')).toEqual([]);
    expect(computeReorder(items, 'a', 'missing')).toEqual([]);
    expect(computeReorder(items, 'a', 'a')).toEqual([]);
  });

  it('reassigns orders when an item moves', () => {
    const items = [
      { id: 'a', order: 1 },
      { id: 'b', order: 2 },
      { id: 'c', order: 3 },
    ];

    expect(computeReorder(items, 'c', 'a')).toEqual([
      { id: 'c', order: 1 },
      { id: 'a', order: 2 },
      { id: 'b', order: 3 },
    ]);
  });

  it('applies temporary offset writes before final orders', async () => {
    const patchOrder = vi.fn().mockResolvedValue(undefined);

    await applyReorder(
      [
        { id: 'c', order: 1 },
        { id: 'a', order: 2 },
      ],
      patchOrder,
    );

    expect(patchOrder.mock.calls).toEqual([
      ['c', 100001],
      ['a', 100002],
      ['c', 1],
      ['a', 2],
    ]);
  });
});

// Drag-to-reorder helper shared by the Loan Steps and Application Form tabs.
// Both LeadFormStep.order (unique per form_schema) and LeadFormField.order
// (unique per step) are PATCHed one row at a time over the REST API, so a
// naive left-to-right reassignment can transiently collide with another
// row's still-unchanged order (e.g. swapping 1↔2 by writing 2 first hits a
// live unique constraint). Renumbering through a temporary offset avoids
// that without needing a bulk-reorder endpoint.
export function computeReorder<T extends { id: string; order: number }>(
  items: T[],
  draggedId: string,
  targetId: string,
): { id: string; order: number }[] {
  const ordered = [...items].sort((a, b) => a.order - b.order);
  const fromIndex = ordered.findIndex((i) => i.id === draggedId);
  const toIndex = ordered.findIndex((i) => i.id === targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return [];

  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(toIndex, 0, moved);

  return ordered
    .map((item, index) => ({ id: item.id, order: index + 1 }))
    .filter((next) => items.find((i) => i.id === next.id)?.order !== next.order);
}

const TEMP_ORDER_OFFSET = 100000;

// Applies a reorder plan via `patchOrder`, two passes through a temporary
// high-offset range so no intermediate write can collide with another row
// that hasn't been updated yet.
export async function applyReorder(
  plan: { id: string; order: number }[],
  patchOrder: (id: string, order: number) => Promise<unknown>,
): Promise<void> {
  for (const { id, order } of plan) {
    await patchOrder(id, order + TEMP_ORDER_OFFSET);
  }
  for (const { id, order } of plan) {
    await patchOrder(id, order);
  }
}

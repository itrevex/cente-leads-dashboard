export const branches = [
  { id: 'branch-kampala', name: 'Kampala Main' },
  { id: 'branch-mukono', name: 'Mukono Branch' },
  { id: 'branch-jinja', name: 'Jinja Branch' },
  { id: 'branch-mbarara', name: 'Mbarara Branch' },
  { id: 'branch-gulu', name: 'Gulu Branch' },
  { id: 'branch-lira', name: 'Lira Branch' },
  { id: 'branch-mbale', name: 'Mbale Branch' },
  { id: 'branch-fort-portal', name: 'Fort Portal Branch' },
  { id: 'branch-arua', name: 'Arua Branch' },
  { id: 'branch-masaka', name: 'Masaka Branch' },
];

export function paginated(results) {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}

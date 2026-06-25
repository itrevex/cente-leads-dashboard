import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageCount, totalCount, pageSize, onPageChange }: Props) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-xs text-ink-400 dark:border-ink-700">
      <span>
        {start}–{end} of {totalCount}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded-sm border border-ink-200 px-2 py-1 font-medium text-ink-600 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
        >
          <ChevronLeft size={13} /> Prev
        </button>
        <span className="px-2">
          Page {page} of {pageCount}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="flex items-center gap-1 rounded-sm border border-ink-200 px-2 py-1 font-medium text-ink-600 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700/40"
        >
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

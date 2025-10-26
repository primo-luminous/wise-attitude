"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
}: PaginationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-700">Items per page</label>
          <select
            className="rounded-lg border border-white/10 bg-white px-2 py-1 text-black
                       focus:outline-none focus:ring-2 focus:ring-black/10"
            value={pageSize}
            onChange={(e) => {
              const v = Number(e.target.value || 10);
              onPageSizeChange(v);
            }}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="text-zinc-700">
          Showing <b>{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</b> to{" "}
          <b>{Math.min(currentPage * pageSize, totalItems)}</b> of <b>{totalItems}</b> items
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="rounded-lg border border-white/10 px-3 py-1 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-black"
        >
          Prev
        </button>
        <span className="text-black">
          Page <b>{currentPage}</b> / <b>{totalPages}</b>
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="rounded-lg border border-white/10 px-3 py-1 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-black"
        >
          Next
        </button>
      </div>
    </div>
  );
}

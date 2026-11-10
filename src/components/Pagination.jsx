import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 12,
  onPageChange,
  onItemsPerPageChange,
  perPageOptions = [12, 24, 48],
  itemLabel = 'products',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(totalItems, currentPage * itemsPerPage);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none">
      {/* Left: Summary and Per Page Selector */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
        <div>
          Showing{' '}
          <span className="font-mono font-bold text-white">
            {startIndex}–{endIndex}
          </span>{' '}
          of <span className="font-mono font-bold text-[#FED430]">{totalItems}</span> {itemLabel}
        </div>

        {onItemsPerPageChange && perPageOptions.length > 0 && (
          <div className="flex items-center gap-1.5 pl-2 sm:border-l border-[#26334D]">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-[#141A26] border border-[#26334D] text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-[#FED430] cursor-pointer font-bold"
            >
              {perPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg bg-[#141A26] border border-[#26334D] text-slate-300 hover:text-white hover:border-[#FED430]/50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Prev Page */}
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg bg-[#141A26] border border-[#26334D] text-slate-300 hover:text-white hover:border-[#FED430]/50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 text-center text-slate-500 font-bold text-xs"
                  >
                    •••
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#FED430] text-black font-black shadow-md shadow-[#FED430]/20 scale-105'
                      : 'bg-[#141A26] border border-[#26334D] text-slate-300 hover:bg-[#1E2839] hover:text-white hover:border-[#FED430]/40'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg bg-[#141A26] border border-[#26334D] text-slate-300 hover:text-white hover:border-[#FED430]/50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg bg-[#141A26] border border-[#26334D] text-slate-300 hover:text-white hover:border-[#FED430]/50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

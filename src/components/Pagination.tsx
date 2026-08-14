/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const buttonClass =
  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-game-teal text-white hover:bg-game-teal/90 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all';

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Nothing to page through — keep the list flush against the card edge.
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-slate-100">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={buttonClass}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={buttonClass}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

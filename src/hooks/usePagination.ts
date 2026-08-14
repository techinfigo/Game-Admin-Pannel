/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

export interface PaginationResult<T> {
  pagedItems: T[];
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}

/**
 * Client-side pagination over an in-memory list.
 *
 * Pass the list you actually want shown (i.e. already filtered/sorted) — the
 * hook only slices, it never reorders.
 */
export function usePagination<T>(items: T[], pageSize: number): PaginationResult<T> {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // Clamp on the way out as well as in the effect below, so a list that shrinks
  // mid-render (search narrowed, last row on the page deleted) never renders blank.
  const currentPage = Math.min(page, totalPages);

  // A changed length means the underlying set changed — a new search term, a
  // delete, a reload — so start the user back at the top of the results.
  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const start = (currentPage - 1) * pageSize;
  const pagedItems = items.slice(start, start + pageSize);

  return { pagedItems, currentPage, totalPages, setPage };
}

export default usePagination;

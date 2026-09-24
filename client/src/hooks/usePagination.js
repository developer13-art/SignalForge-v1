/**
 * usePagination Hook
 *
 * Client-side pagination helper for lists that are already loaded in
 * memory. For server-side pagination, combine this with React Query
 * pagination parameters.
 *
 * @module client/src/hooks/usePagination
 */

import { useState, useMemo, useCallback } from 'react';

const DEFAULT_PAGE_SIZE = 20;

export function usePagination({ totalItems = 0, initialPage = 1, initialPageSize = DEFAULT_PAGE_SIZE } = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    if (pageSize <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const nextPage = useCallback(() => {
    setPage((current) => Math.min(current + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((current) => Math.max(current - 1, 1));
  }, []);

  const goToPage = useCallback(
    (target) => {
      const resolved = Math.min(Math.max(1, target), totalPages);
      setPage(resolved);
    },
    [totalPages],
  );

  const changePageSize = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    offset,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    setPage,
    setPageSize: changePageSize,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
}

export function paginateItems({ items, page, pageSize }) {
  if (!Array.isArray(items)) {
    return [];
  }
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export default usePagination;
/**
 * Pagination Helper
 *
 * SQL-level pagination helpers used by repositories that do not use
 * the shared pagination utility from @signalforge/shared.
 *
 * @module server/database/helpers/pagination.helper
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;

export function normalizePagination({ page = 1, limit = DEFAULT_LIMIT } = {}) {
  let resolvedPage = Number(page);
  let resolvedLimit = Number(limit);

  if (!Number.isInteger(resolvedPage) || resolvedPage < 1) {
    resolvedPage = 1;
  }

  if (!Number.isInteger(resolvedLimit) || resolvedLimit < 1) {
    resolvedLimit = DEFAULT_LIMIT;
  }

  if (resolvedLimit > MAX_LIMIT) {
    resolvedLimit = MAX_LIMIT;
  }

  return {
    page: resolvedPage,
    limit: resolvedLimit,
    offset: (resolvedPage - 1) * resolvedLimit,
  };
}

export function buildPaginationMeta({ page, limit, total }) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function applyPagination({ baseSql, pagination, paramStartIndex = 1 }) {
  const { limit, offset } = normalizePagination(pagination);

  return {
    text: `${baseSql} LIMIT $${paramStartIndex} OFFSET $${paramStartIndex + 1}`,
    params: [limit, offset],
    limit,
    offset,
  };
}

export const paginationHelper = {
  normalizePagination,
  buildPaginationMeta,
  applyPagination,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
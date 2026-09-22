/**
 * Pagination Utilities
 *
 * Provides helpers for paginating API responses, computing offsets,
 * and constructing pagination metadata.
 *
 * @module @signalforge/shared/utils/pagination
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;
const MIN_LIMIT = 1;

export function normalizePagination(options = {}) {
  let page = Number(options.page);
  let limit = Number(options.limit);

  if (!Number.isInteger(page) || page < 1) {
    page = DEFAULT_PAGE;
  }

  if (!Number.isInteger(limit) || limit < MIN_LIMIT) {
    limit = DEFAULT_LIMIT;
  }

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function normalizeCursorPagination(options = {}) {
  let limit = Number(options.limit);

  if (!Number.isInteger(limit) || limit < MIN_LIMIT) {
    limit = DEFAULT_LIMIT;
  }

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  return {
    limit,
    cursor: options.cursor || null,
    direction: options.direction === 'backward' ? 'backward' : 'forward',
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

export function buildCursorMeta({ limit, items, cursorField = 'id' }) {
  const hasMore = items.length > limit;
  const resultItems = hasMore ? items.slice(0, limit) : items;

  let nextCursor = null;
  if (hasMore && resultItems.length > 0) {
    nextCursor = resultItems[resultItems.length - 1][cursorField];
  }

  return {
    items: resultItems,
    nextCursor,
    hasMore,
    limit,
  };
}

export function buildPaginationLinks({ baseUrl, page, limit, totalPages }) {
  const buildUrl = (p) => {
    const url = new URL(baseUrl);
    url.searchParams.set('page', String(p));
    url.searchParams.set('limit', String(limit));
    return url.toString();
  };

  const links = {
    first: buildUrl(1),
    last: buildUrl(totalPages),
  };

  if (page > 1) {
    links.previous = buildUrl(page - 1);
  }

  if (page < totalPages) {
    links.next = buildUrl(page + 1);
  }

  return links;
}

export function applyPagination(sql, options = {}) {
  const { limit, offset } = normalizePagination(options);
  return {
    sql: `${sql} LIMIT $1 OFFSET $2`,
    params: [limit, offset],
  };
}

export function calculateTotalPages(total, limit) {
  if (typeof total !== 'number' || total < 0) {
    return 0;
  }
  if (typeof limit !== 'number' || limit <= 0) {
    return 0;
  }
  return Math.ceil(total / limit);
}

export function getOffsetFromCursor(items, cursorField, cursorValue) {
  if (!Array.isArray(items) || items.length === 0 || !cursorValue) {
    return 0;
  }
  const index = items.findIndex((item) => item[cursorField] === cursorValue);
  if (index === -1) {
    return 0;
  }
  return index + 1;
}

export function validatePaginationParams(params = {}) {
  const errors = [];

  if (params.page !== undefined) {
    const page = Number(params.page);
    if (!Number.isInteger(page) || page < 1) {
      errors.push('Page must be a positive integer');
    }
  }

  if (params.limit !== undefined) {
    const limit = Number(params.limit);
    if (!Number.isInteger(limit) || limit < MIN_LIMIT) {
      errors.push(`Limit must be an integer of at least ${MIN_LIMIT}`);
    }
    if (limit > MAX_LIMIT) {
      errors.push(`Limit must not exceed ${MAX_LIMIT}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export const PAGINATION_CONSTRAINTS = Object.freeze({
  defaultPage: DEFAULT_PAGE,
  defaultLimit: DEFAULT_LIMIT,
  minLimit: MIN_LIMIT,
  maxLimit: MAX_LIMIT,
});
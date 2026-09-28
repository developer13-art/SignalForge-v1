/**
 * Offset Pagination
 *
 * @module server/lib/pagination/offset-pagination
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;
const MIN_LIMIT = 1;

export function normalize({ page, limit } = {}) {
  let resolvedPage = Number(page);
  let resolvedLimit = Number(limit);

  if (!Number.isInteger(resolvedPage) || resolvedPage < 1) {
    resolvedPage = DEFAULT_PAGE;
  }

  if (!Number.isInteger(resolvedLimit) || resolvedLimit < MIN_LIMIT) {
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

export function buildMeta({ page, limit, total }) {
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

export function buildLinks({ baseUrl, page, limit, totalPages }) {
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

export const offsetPagination = {
  normalize,
  buildMeta,
  buildLinks,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MIN_LIMIT,
};
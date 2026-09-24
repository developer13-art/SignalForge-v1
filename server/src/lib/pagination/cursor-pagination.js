/**
 * Cursor Pagination
 *
 * Cursor-based pagination helpers. Suitable for large, frequently
 * changing datasets where offset pagination is not efficient.
 *
 * @module server/lib/pagination/cursor-pagination
 */

import { createHash } from 'node:crypto';

export function encodeCursor({ cursorField, value }) {
  if (value === undefined || value === null) {
    return null;
  }

  const payload = JSON.stringify({ [cursorField]: value });

  return Buffer.from(payload, 'utf8').toString('base64url');
}

export function decodeCursor({ cursor }) {
  if (!cursor || typeof cursor !== 'string') {
    return null;
  }

  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded);
    return parsed;
  } catch (err) {
    return null;
  }
}

export function buildCursorResponse({ items, limit, cursorField = 'id' }) {
  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;

  let nextCursor = null;

  if (hasMore && sliced.length > 0) {
    const lastItem = sliced[sliced.length - 1];
    nextCursor = encodeCursor({
      cursorField,
      value: lastItem[cursorField],
    });
  }

  return {
    items: sliced,
    nextCursor,
    hasMore,
    limit,
  };
}

export function buildCursorConditions({ cursor, cursorField = 'id', operator = '<' }) {
  if (!cursor) {
    return { where: '', params: [] };
  }

  const decoded = decodeCursor({ cursor });

  if (!decoded || decoded[cursorField] === undefined) {
    return { where: '', params: [] };
  }

  return {
    where: `${cursorField} ${operator} $1`,
    params: [decoded[cursorField]],
  };
}

export function fingerprintCursor({ cursor }) {
  if (!cursor) {
    return null;
  }
  return createHash('sha256').update(cursor).digest('hex').substring(0, 16);
}

export const cursorPagination = {
  encodeCursor,
  decodeCursor,
  buildCursorResponse,
  buildCursorConditions,
  fingerprintCursor,
};
/**
 * String Utilities
 *
 * @module server/utils/string.util
 */

export function truncate(value, maxLength, ellipsis = '...') {
  if (typeof value !== 'string') {
    return null;
  }
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.substring(0, maxLength - ellipsis.length)}${ellipsis}`;
}

export function slugify(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

export function capitalize(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value.charAt(0).toUpperCase() + value.substring(1);
}

export function titleCase(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(' ');
}

export function stripHtml(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value.replace(/<[^>]*>/g, '');
}

export function escapeHtml(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeRegex(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isBlank(value) {
  if (value === null || value === undefined) {
    return true;
  }
  return typeof value === 'string' && value.trim().length === 0;
}

export function extractNumbers(value) {
  if (typeof value !== 'string') {
    return [];
  }
  const matches = value.match(/-?\d+(\.\d+)?/g);
  return matches ? matches.map(Number).filter((n) => Number.isFinite(n)) : [];
}

export function sanitizeIdentifier(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 128);
}

export const stringUtil = {
  truncate,
  slugify,
  capitalize,
  titleCase,
  stripHtml,
  escapeHtml,
  escapeRegex,
  isBlank,
  extractNumbers,
  sanitizeIdentifier,
};
/**
 * String Utilities
 *
 * Provides string manipulation helpers used across the SignalForge
 * platform for text normalization, sanitization, and formatting.
 *
 * @module @signalforge/shared/utils/string
 */

export function truncate(value, maxLength, ellipsis = '...') {
  if (typeof value !== 'string') {
    return null;
  }
  if (value.length <= maxLength) {
    return value;
  }
  if (ellipsis.length >= maxLength) {
    return value.substring(0, maxLength);
  }
  return value.substring(0, maxLength - ellipsis.length) + ellipsis;
}

export function capitalize(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value.charAt(0).toUpperCase() + value.substring(1);
}

export function titleCase(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(' ');
}

export function camelCase(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  const words = value.toLowerCase().split(/[\s_-]+/);
  return words
    .map((word, index) => {
      if (index === 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.substring(1);
    })
    .join('');
}

export function snakeCase(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function kebabCase(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function pascalCase(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  const words = value.toLowerCase().split(/[\s_-]+/);
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join('');
}

export function slugify(value) {
  if (typeof value !== 'string' || value.length === 0) {
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

export function removeWhitespace(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value.replace(/\s+/g, '');
}

export function normalizeWhitespace(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value.replace(/\s+/g, ' ').trim();
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

export function sanitizeIdentifier(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 128);
}

export function escapeRegex(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function padStart(value, length, padChar = '0') {
  if (typeof value !== 'string') {
    return null;
  }
  return value.padStart(length, padChar);
}

export function padEnd(value, length, padChar = ' ') {
  if (typeof value !== 'string') {
    return null;
  }
  return value.padEnd(length, padChar);
}

export function isBlank(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  return false;
}

export function containsAny(value, substrings) {
  if (typeof value !== 'string' || !Array.isArray(substrings)) {
    return false;
  }
  const lower = value.toLowerCase();
  return substrings.some((sub) => lower.includes(String(sub).toLowerCase()));
}

export function containsAll(value, substrings) {
  if (typeof value !== 'string' || !Array.isArray(substrings)) {
    return false;
  }
  const lower = value.toLowerCase();
  return substrings.every((sub) => lower.includes(String(sub).toLowerCase()));
}

export function countOccurrences(value, substring) {
  if (typeof value !== 'string' || typeof substring !== 'string' || substring.length === 0) {
    return 0;
  }
  let count = 0;
  let position = 0;
  while ((position = value.indexOf(substring, position)) !== -1) {
    count++;
    position += substring.length;
  }
  return count;
}

export function splitLines(value) {
  if (typeof value !== 'string') {
    return [];
  }
  return value.split(/\r?\n/).map((line) => line.trim());
}

export function extractNumbers(value) {
  if (typeof value !== 'string') {
    return [];
  }
  const matches = value.match(/-?\d+(\.\d+)?/g);
  if (!matches) {
    return [];
  }
  return matches.map(Number).filter((n) => Number.isFinite(n));
}

export function extractFirstNumber(value) {
  const numbers = extractNumbers(value);
  return numbers.length > 0 ? numbers[0] : null;
}

export function removeEmojis(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value.replace(
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
    '',
  );
}

export function reverse(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return value.split('').reverse().join('');
}

export function isEmptyOrWhitespace(value) {
  return typeof value !== 'string' || value.trim().length === 0;
}

export function toBooleanString(value, options = {}) {
  const trueValues = options.trueValues || ['true', '1', 'yes', 'on', 'enabled'];
  const falseValues = options.falseValues || ['false', '0', 'no', 'off', 'disabled'];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (trueValues.includes(lower)) {
      return true;
    }
    if (falseValues.includes(lower)) {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return options.default ?? false;
}

export const STRING_CONSTRAINTS = Object.freeze({
  maxSlugLength: 128,
  maxIdentifierLength: 128,
});
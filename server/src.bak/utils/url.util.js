/**
 * URL Utilities
 *
 * @module server/utils/url.util
 */

export function isValidUrl(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

export function buildUrl({ base, path, query }) {
  if (!base) {
    throw new Error('base is required');
  }
  const url = new URL(path || '', base);
  if (query && typeof query === 'object') {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export function appendQuery({ url, query }) {
  return buildUrl({ base: url, query });
}

export function extractHostname(value) {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    return url.hostname;
  } catch (err) {
    return null;
  }
}

export function isSafeRedirect({ target, allowedHosts = [] }) {
  if (!target) {
    return false;
  }
  try {
    const url = new URL(target);
    if (allowedHosts.length === 0) {
      return url.protocol === 'https:';
    }
    return allowedHosts.includes(url.hostname);
  } catch (err) {
    return false;
  }
}

export function normalizeUrl(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString();
  } catch (err) {
    return null;
  }
}

export const urlUtil = {
  isValidUrl,
  buildUrl,
  appendQuery,
  extractHostname,
  isSafeRedirect,
  normalizeUrl,
};
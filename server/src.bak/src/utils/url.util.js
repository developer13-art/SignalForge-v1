/**
 * URL Utilities
 *
 * @module server/utils/url.util
 */
function isValidUrl(value) {
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
function buildUrl({ base, path, query }) {
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
function appendQuery({ url, query }) {
  return buildUrl({ base: url, query });
}
function extractHostname(value) {
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
function isSafeRedirect({ target, allowedHosts = [] }) {
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
function normalizeUrl(value) {
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
const urlUtil = {
  isValidUrl,
  buildUrl,
  appendQuery,
  extractHostname,
  isSafeRedirect,
  normalizeUrl,
};
module.exports.urlUtil = urlUtil;
module.exports.isValidUrl = isValidUrl;
module.exports.buildUrl = buildUrl;
module.exports.appendQuery = appendQuery;
module.exports.extractHostname = extractHostname;
module.exports.isSafeRedirect = isSafeRedirect;
module.exports.normalizeUrl = normalizeUrl;

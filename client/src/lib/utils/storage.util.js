/**
 * Storage Utility
 *
 * Typed wrappers around `localStorage` and `sessionStorage` with a
 * consistent namespace prefix. Fails silently when storage is not
 * available (e.g. during SSR or in private browsing).
 *
 * @module client/src/lib/utils/storage.util
 */

import { appConfig } from '../../config/app.config.js';

const PREFIX = appConfig.storage.prefix;

function buildKey(key) {
  return `${PREFIX}.${key}`;
}

function safeGetStorage(type) {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return type === 'session' ? window.sessionStorage : window.localStorage;
  } catch (err) {
    return null;
  }
}

export function setItem(key, value, { type = 'local' } = {}) {
  const storage = safeGetStorage(type);
  if (!storage) {
    return false;
  }
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    storage.setItem(buildKey(key), serialized);
    return true;
  } catch (err) {
    return false;
  }
}

export function getItem(key, { type = 'local', fallback = null } = {}) {
  const storage = safeGetStorage(type);
  if (!storage) {
    return fallback;
  }
  try {
    const raw = storage.getItem(buildKey(key));
    if (raw === null) {
      return fallback;
    }
    try {
      return JSON.parse(raw);
    } catch (err) {
      return raw;
    }
  } catch (err) {
    return fallback;
  }
}

export function removeItem(key, { type = 'local' } = {}) {
  const storage = safeGetStorage(type);
  if (!storage) {
    return false;
  }
  try {
    storage.removeItem(buildKey(key));
    return true;
  } catch (err) {
    return false;
  }
}

export function clearAll({ type = 'local' } = {}) {
  const storage = safeGetStorage(type);
  if (!storage) {
    return false;
  }
  try {
    const keys = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(`${PREFIX}.`)) {
        keys.push(key);
      }
    }
    for (const key of keys) {
      storage.removeItem(key);
    }
    return true;
  } catch (err) {
    return false;
  }
}

export const storage = {
  setItem,
  getItem,
  removeItem,
  clearAll,
  local: {
    set: (key, value) => setItem(key, value, { type: 'local' }),
    get: (key, fallback) => getItem(key, { type: 'local', fallback }),
    remove: (key) => removeItem(key, { type: 'local' }),
    clear: () => clearAll({ type: 'local' }),
  },
  session: {
    set: (key, value) => setItem(key, value, { type: 'session' }),
    get: (key, fallback) => getItem(key, { type: 'session', fallback }),
    remove: (key) => removeItem(key, { type: 'session' }),
    clear: () => clearAll({ type: 'session' }),
  },
};

export default storage;
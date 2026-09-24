/**
 * Object Utilities
 *
 * @module server/utils/object.util
 */

export function pick(object, keys) {
  if (!object || typeof object !== 'object' || !Array.isArray(keys)) {
    return {};
  }
  const result = {};
  for (const key of keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
}

export function omit(object, keys) {
  if (!object || typeof object !== 'object' || !Array.isArray(keys)) {
    return {};
  }
  const result = { ...object };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function isEmpty(object) {
  if (!object || typeof object !== 'object') {
    return true;
  }
  return Object.keys(object).length === 0;
}

export function deepMerge(target, source) {
  if (!target || typeof target !== 'object') {
    return source;
  }
  if (!source || typeof source !== 'object') {
    return target;
  }

  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(target[key] || {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function deepClone(object) {
  if (object === null || typeof object !== 'object') {
    return object;
  }
  return JSON.parse(JSON.stringify(object));
}

export function mapValues(object, fn) {
  if (!object || typeof object !== 'object') {
    return {};
  }
  const result = {};
  for (const [key, value] of Object.entries(object)) {
    result[key] = fn(value, key);
  }
  return result;
}

export function filterKeys(object, predicate) {
  if (!object || typeof object !== 'object') {
    return {};
  }
  const result = {};
  for (const [key, value] of Object.entries(object)) {
    if (predicate(key, value)) {
      result[key] = value;
    }
  }
  return result;
}

export function hasKey(object, key) {
  if (!object || typeof object !== 'object') {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function getNestedValue(object, path, fallback = null) {
  if (!object || !path) {
    return fallback;
  }
  const parts = String(path).split('.');
  let current = object;
  for (const part of parts) {
    if (current === null || current === undefined) {
      return fallback;
    }
    current = current[part];
  }
  return current === undefined ? fallback : current;
}

export function setNestedValue(object, path, value) {
  if (!object || !path) {
    return object;
  }
  const parts = String(path).split('.');
  let current = object;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
  return object;
}

export const objectUtil = {
  pick,
  omit,
  isEmpty,
  deepMerge,
  deepClone,
  mapValues,
  filterKeys,
  hasKey,
  getNestedValue,
  setNestedValue,
};
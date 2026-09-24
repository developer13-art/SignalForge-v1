/**
 * Form Validator
 *
 * Small helper utilities for composing validation logic in forms.
 *
 * @module client/src/lib/validators/form.validator
 */

export function isRequired(value) {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

export function isMinLength(value, min) {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length >= min;
}

export function isMaxLength(value, max) {
  if (typeof value !== 'string') {
    return true;
  }
  return value.length <= max;
}

export function isNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed);
  }
  return false;
}

export function isBetween(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return false;
  }
  return num >= min && num <= max;
}

export function isUrl(value) {
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

export function isOneOf(value, allowed) {
  if (!Array.isArray(allowed)) {
    return false;
  }
  return allowed.includes(value);
}

export function runValidators(value, validators) {
  const errors = [];

  for (const validator of validators) {
    if (typeof validator !== 'function') {
      continue;
    }
    const result = validator(value);
    if (typeof result === 'string') {
      errors.push(result);
    } else if (result === false) {
      errors.push('Validation failed');
    }
  }

  return { valid: errors.length === 0, errors };
}

export const formValidator = {
  isRequired,
  isMinLength,
  isMaxLength,
  isNumber,
  isBetween,
  isUrl,
  isOneOf,
  runValidators,
};
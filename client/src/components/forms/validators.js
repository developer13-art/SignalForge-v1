/**
 * SignalForge Form Validation Library
 *
 * Provides composable validators and helpers for form-level validation.
 * Each validator returns either `null` (valid) or a string error message.
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;
const URL_REGEX = /^(https?:\/\/)?([\w.-]+)+(:\d+)?(\/[\w./?%&=-]*)?$/i;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const isString = (value) => typeof value === 'string';
export const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);
export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isArray = (value) => Array.isArray(value);
export const isFunction = (value) => typeof value === 'function';
export const isEmpty = (value) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (isArray(value) && value.length === 0) ||
  (isObject(value) && Object.keys(value).length === 0);

export function required(message = 'This field is required') {
  return (value) => {
    if (isEmpty(value) && value !== 0 && value !== false) {
      return message;
    }
    return null;
  };
}

export function minLength(length, message) {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    if (String(value).length < length) {
      return message || `Must be at least ${length} characters`;
    }
    return null;
  };
}

export function maxLength(length, message) {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    if (String(value).length > length) {
      return message || `Must be at most ${length} characters`;
    }
    return null;
  };
}

export function lengthBetween(min, max, message) {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    const len = String(value).length;
    if (len < min || len > max) {
      return message || `Must be between ${min} and ${max} characters`;
    }
    return null;
  };
}

export function min(value, message) {
  return (input) => {
    if (isEmpty(input)) {
      return null;
    }
    const num = Number(input);
    if (Number.isNaN(num) || num < value) {
      return message || `Must be at least ${value}`;
    }
    return null;
  };
}

export function max(value, message) {
  return (input) => {
    if (isEmpty(input)) {
      return null;
    }
    const num = Number(input);
    if (Number.isNaN(num) || num > value) {
      return message || `Must be at most ${value}`;
    }
    return null;
  };
}

export function numeric(message = 'Must be a number') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    if (Number.isNaN(Number(value))) {
      return message;
    }
    return null;
  };
}

export function integer(message = 'Must be a whole number') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    const num = Number(value);
    if (Number.isNaN(num) || !Number.isInteger(num)) {
      return message;
    }
    return null;
  };
}

export function decimal(message = 'Must be a decimal number') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      return message;
    }
    return null;
  };
}

export function email(message = 'Enter a valid email address') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    if (!EMAIL_REGEX.test(String(value).trim())) {
      return message;
    }
    return null;
  };
}

export function phone(message = 'Enter a valid phone number') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    const cleaned = String(value).replace(/[\s()-]/g, '');
    if (!PHONE_REGEX.test(cleaned)) {
      return message;
    }
    return null;
  };
}

export function url(message = 'Enter a valid URL') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    if (!URL_REGEX.test(String(value).trim())) {
      return message;
    }
    return null;
  };
}

export function username(message = 'Username may contain letters, numbers, and underscores (3-30 chars)') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    if (!USERNAME_REGEX.test(String(value))) {
      return message;
    }
    return null;
  };
}

export function pattern(regex, message = 'Invalid format') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    if (!regex.test(String(value))) {
      return message;
    }
    return null;
  };
}

export function hexColor(message = 'Enter a valid hex color') {
  return pattern(HEX_COLOR_REGEX, message);
}

export function solanaAddress(message = 'Enter a valid Solana wallet address') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    if (!BASE58_REGEX.test(String(value))) {
      return message;
    }
    return null;
  };
}

export function matches(getOtherValue, message = 'Values do not match') {
  return (value) => {
    const other = typeof getOtherValue === 'function' ? getOtherValue() : getOtherValue;
    if (value !== other) {
      return message;
    }
    return null;
  };
}

export function oneOf(allowed, message = 'Invalid selection') {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    if (!allowed.includes(value)) {
      return message;
    }
    return null;
  };
}

export function password({ min: minLen = 8, requireUppercase = true, requireLowercase = true, requireNumber = true, requireSymbol = false } = {}) {
  return (value) => {
    if (isEmpty(value)) {
      return null;
    }
    const str = String(value);
    if (str.length < minLen) {
      return `Password must be at least ${minLen} characters`;
    }
    if (requireUppercase && !/[A-Z]/.test(str)) {
      return 'Password must contain an uppercase letter';
    }
    if (requireLowercase && !/[a-z]/.test(str)) {
      return 'Password must contain a lowercase letter';
    }
    if (requireNumber && !/\d/.test(str)) {
      return 'Password must contain a number';
    }
    if (requireSymbol && !/[^A-Za-z0-9]/.test(str)) {
      return 'Password must contain a symbol';
    }
    return null;
  };
}

export function custom(fn) {
  return (value, values) => {
    const result = fn(value, values);
    if (result === true || result === null || result === undefined) {
      return null;
    }
    if (typeof result === 'string') {
      return result;
    }
    return 'Invalid value';
  };
}

/**
 * Compose multiple validators. Runs them in order and returns the first error.
 */
export function compose(...validators) {
  return (value, values) => {
    for (const validator of validators) {
      if (typeof validator !== 'function') {
        continue;
      }
      const result = validator(value, values);
      if (result) {
        return result;
      }
    }
    return null;
  };
}

/**
 * Validate a values object against a schema of validator functions.
 *
 * @param {Object} values
 * @param {Object} schema - { field: validatorFn | validatorFn[] }
 * @returns {Object} errors keyed by field
 */
export function validateForm(values, schema) {
  const errors = {};
  Object.keys(schema).forEach((field) => {
    const validators = Array.isArray(schema[field]) ? schema[field] : [schema[field]];
    for (const validator of validators) {
      if (typeof validator !== 'function') {
        continue;
      }
      const result = validator(values ? values[field] : undefined, values);
      if (result) {
        errors[field] = result;
        break;
      }
    }
  });
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors || {}).some((key) => Boolean(errors[key]));
}

export const validators = {
  required,
  minLength,
  maxLength,
  lengthBetween,
  min,
  max,
  numeric,
  integer,
  decimal,
  email,
  phone,
  url,
  username,
  pattern,
  hexColor,
  solanaAddress,
  matches,
  oneOf,
  password,
  custom,
  compose,
  validateForm,
  hasErrors,
};

export default validators;
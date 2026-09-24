/**
 * Number Utilities
 *
 * @module server/utils/number.util
 */

export function toNumber(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }
  if (typeof input === 'string') {
    const parsed = Number(input.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function round(value, precision = 8) {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

export function clamp(value, min, max) {
  const num = toNumber(value);
  if (num === null) {
    return null;
  }
  return Math.min(Math.max(num, min), max);
}

export function sum(values) {
  if (!Array.isArray(values)) {
    return 0;
  }
  return values.reduce((acc, v) => acc + (toNumber(v) || 0), 0);
}

export function average(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const valid = values.map(toNumber).filter((v) => v !== null);
  if (valid.length === 0) {
    return null;
  }
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function max(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const valid = values.map(toNumber).filter((v) => v !== null);
  return valid.length === 0 ? null : Math.max(...valid);
}

export function min(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const valid = values.map(toNumber).filter((v) => v !== null);
  return valid.length === 0 ? null : Math.min(...valid);
}

export function percentOf(part, total) {
  const a = toNumber(part);
  const b = toNumber(total);
  if (a === null || b === null || b === 0) {
    return null;
  }
  return (a / b) * 100;
}

export function safeDivide(numerator, denominator, fallback = 0) {
  const a = toNumber(numerator);
  const b = toNumber(denominator);
  if (a === null || b === null || b === 0) {
    return fallback;
  }
  return a / b;
}

export function isWithin(value, min, max) {
  const num = toNumber(value);
  if (num === null) {
    return false;
  }
  return num >= min && num <= max;
}

export const numberUtil = {
  toNumber,
  round,
  clamp,
  sum,
  average,
  max,
  min,
  percentOf,
  safeDivide,
  isWithin,
};
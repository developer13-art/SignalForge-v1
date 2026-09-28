/**
 * Assert Utilities
 *
 * @module server/utils/assert.util
 */

export class AssertionError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'AssertionError';
    this.code = 'ASSERTION_FAILED';
    this.details = details;
  }
}

export function assert(condition, message, details = null) {
  if (!condition) {
    throw new AssertionError(message || 'Assertion failed', details);
  }
}

export function assertDefined(value, message) {
  if (value === undefined || value === null) {
    throw new AssertionError(message || 'Value must not be null or undefined');
  }
}

export function assertString(value, message) {
  if (typeof value !== 'string') {
    throw new AssertionError(message || 'Value must be a string');
  }
}

export function assertNumber(value, message) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new AssertionError(message || 'Value must be a finite number');
  }
}

export function assertObject(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AssertionError(message || 'Value must be a plain object');
  }
}

export function assertArray(value, message) {
  if (!Array.isArray(value)) {
    throw new AssertionError(message || 'Value must be an array');
  }
}

export function assertNotEmpty(value, message) {
  if (value === null || value === undefined) {
    throw new AssertionError(message || 'Value must not be empty');
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    throw new AssertionError(message || 'String must not be empty');
  }
  if (Array.isArray(value) && value.length === 0) {
    throw new AssertionError(message || 'Array must not be empty');
  }
}

export function invariant(condition, message) {
  if (!condition) {
    throw new AssertionError(message || 'Invariant violated');
  }
}

export const assertUtil = {
  assert,
  assertDefined,
  assertString,
  assertNumber,
  assertObject,
  assertArray,
  assertNotEmpty,
  invariant,
  AssertionError,
};
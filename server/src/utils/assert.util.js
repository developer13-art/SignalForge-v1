/**
 * Assert Utilities
 *
 * @module server/utils/assert.util
 */
class AssertionError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'AssertionError';
    this.code = 'ASSERTION_FAILED';
    this.details = details;
  }
}
function assert(condition, message, details = null) {
  if (!condition) {
    throw new AssertionError(message || 'Assertion failed', details);
  }
}
function assertDefined(value, message) {
  if (value === undefined || value === null) {
    throw new AssertionError(message || 'Value must not be null or undefined');
  }
}
function assertString(value, message) {
  if (typeof value !== 'string') {
    throw new AssertionError(message || 'Value must be a string');
  }
}
function assertNumber(value, message) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new AssertionError(message || 'Value must be a finite number');
  }
}
function assertObject(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AssertionError(message || 'Value must be a plain object');
  }
}
function assertArray(value, message) {
  if (!Array.isArray(value)) {
    throw new AssertionError(message || 'Value must be an array');
  }
}
function assertNotEmpty(value, message) {
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
function invariant(condition, message) {
  if (!condition) {
    throw new AssertionError(message || 'Invariant violated');
  }
}
const assertUtil = {
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
module.exports.assertUtil = assertUtil;
module.exports.assert = assert;
module.exports.assertDefined = assertDefined;
module.exports.assertString = assertString;
module.exports.assertNumber = assertNumber;
module.exports.assertObject = assertObject;
module.exports.assertArray = assertArray;
module.exports.assertNotEmpty = assertNotEmpty;
module.exports.invariant = invariant;

module.exports.AssertionError = AssertionError;

/**
 * Assertion Utilities
 *
 * Provides assertion helpers used for runtime validation, defensive
 * programming, and invariant checks across the SignalForge platform.
 *
 * @module @signalforge/shared/utils/assert
 */

export class AssertionError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'AssertionError';
    this.code = options.code || 'ASSERTION_FAILED';
    this.details = options.details || null;
  }
}

export function assert(condition, message, options = {}) {
  if (!condition) {
    throw new AssertionError(message || 'Assertion failed', options);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new AssertionError(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
      { code: 'ASSERT_EQUAL_FAILED', details: { actual, expected } },
    );
  }
}

export function assertNotEqual(actual, expected, message) {
  if (actual === expected) {
    throw new AssertionError(
      message || `Expected values to differ, both are ${JSON.stringify(actual)}`,
      { code: 'ASSERT_NOT_EQUAL_FAILED', details: { actual, expected } },
    );
  }
}

export function assertDeepEqual(actual, expected, message) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new AssertionError(
      message || `Expected ${expectedJson}, got ${actualJson}`,
      { code: 'ASSERT_DEEP_EQUAL_FAILED', details: { actual, expected } },
    );
  }
}

export function assertTruthy(value, message) {
  if (!value) {
    throw new AssertionError(message || 'Expected value to be truthy', {
      code: 'ASSERT_TRUTHY_FAILED',
      details: { value },
    });
  }
}

export function assertFalsy(value, message) {
  if (value) {
    throw new AssertionError(message || 'Expected value to be falsy', {
      code: 'ASSERT_FALSY_FAILED',
      details: { value },
    });
  }
}

export function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new AssertionError(message || 'Value must not be null or undefined', {
      code: 'ASSERT_NOT_NULL_FAILED',
    });
  }
}

export function assertIsString(value, message) {
  if (typeof value !== 'string') {
    throw new AssertionError(message || 'Value must be a string', {
      code: 'ASSERT_STRING_FAILED',
      details: { type: typeof value },
    });
  }
}

export function assertIsNumber(value, message) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new AssertionError(message || 'Value must be a finite number', {
      code: 'ASSERT_NUMBER_FAILED',
      details: { type: typeof value, value },
    });
  }
}

export function assertIsBoolean(value, message) {
  if (typeof value !== 'boolean') {
    throw new AssertionError(message || 'Value must be a boolean', {
      code: 'ASSERT_BOOLEAN_FAILED',
      details: { type: typeof value },
    });
  }
}

export function assertIsArray(value, message) {
  if (!Array.isArray(value)) {
    throw new AssertionError(message || 'Value must be an array', {
      code: 'ASSERT_ARRAY_FAILED',
      details: { type: typeof value },
    });
  }
}

export function assertIsObject(value, message) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new AssertionError(message || 'Value must be a plain object', {
      code: 'ASSERT_OBJECT_FAILED',
      details: { type: typeof value, isArray: Array.isArray(value) },
    });
  }
}

export function assertIsFunction(value, message) {
  if (typeof value !== 'function') {
    throw new AssertionError(message || 'Value must be a function', {
      code: 'ASSERT_FUNCTION_FAILED',
      details: { type: typeof value },
    });
  }
}

export function assertIsUuid(value, message) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof value !== 'string' || !uuidRegex.test(value)) {
    throw new AssertionError(message || 'Value must be a valid UUID', {
      code: 'ASSERT_UUID_FAILED',
      details: { value },
    });
  }
}

export function assertIsIsoDate(value, message) {
  if (typeof value !== 'string') {
    throw new AssertionError(message || 'Value must be an ISO date string', {
      code: 'ASSERT_ISO_DATE_FAILED',
      details: { value },
    });
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AssertionError(message || 'Value must be a valid ISO date string', {
      code: 'ASSERT_ISO_DATE_FAILED',
      details: { value },
    });
  }
}

export function assertInRange(value, min, max, message) {
  if (typeof value !== 'number' || value < min || value > max) {
    throw new AssertionError(
      message || `Value must be between ${min} and ${max}`,
      { code: 'ASSERT_RANGE_FAILED', details: { value, min, max } },
    );
  }
}

export function assertOneOf(value, allowed, message) {
  if (!Array.isArray(allowed) || !allowed.includes(value)) {
    throw new AssertionError(
      message || `Value must be one of: ${allowed.join(', ')}`,
      { code: 'ASSERT_ONE_OF_FAILED', details: { value, allowed } },
    );
  }
}

export function assertNotEmpty(value, message) {
  if (value === null || value === undefined) {
    throw new AssertionError(message || 'Value must not be empty', {
      code: 'ASSERT_NOT_EMPTY_FAILED',
    });
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    throw new AssertionError(message || 'String must not be empty', {
      code: 'ASSERT_NOT_EMPTY_FAILED',
    });
  }

  if (Array.isArray(value) && value.length === 0) {
    throw new AssertionError(message || 'Array must not be empty', {
      code: 'ASSERT_NOT_EMPTY_FAILED',
    });
  }

  if (typeof value === 'object' && Object.keys(value).length === 0) {
    throw new AssertionError(message || 'Object must not be empty', {
      code: 'ASSERT_NOT_EMPTY_FAILED',
    });
  }
}

export function assertNoThrow(fn, message) {
  try {
    fn();
  } catch (error) {
    throw new AssertionError(
      message || `Expected function not to throw, but it threw: ${error.message}`,
      { code: 'ASSERT_NO_THROW_FAILED', details: { originalError: error.message } },
    );
  }
}

export function assertThrows(fn, message) {
  let threw = false;
  try {
    fn();
  } catch (error) {
    threw = true;
  }
  if (!threw) {
    throw new AssertionError(message || 'Expected function to throw', {
      code: 'ASSERT_THROWS_FAILED',
    });
  }
}

export function assertDefined(value, message) {
  if (value === undefined) {
    throw new AssertionError(message || 'Value must be defined', {
      code: 'ASSERT_DEFINED_FAILED',
    });
  }
}

export function assertHasProperty(object, property, message) {
  if (!object || typeof object !== 'object' || !(property in object)) {
    throw new AssertionError(
      message || `Object must have property "${property}"`,
      { code: 'ASSERT_PROPERTY_FAILED', details: { property } },
    );
  }
}

export function assertHasProperties(object, properties, message) {
  if (!object || typeof object !== 'object' || !Array.isArray(properties)) {
    throw new AssertionError(
      message || 'Object and properties array must be provided',
      { code: 'ASSERT_PROPERTIES_FAILED' },
    );
  }

  const missing = properties.filter((prop) => !(prop in object));

  if (missing.length > 0) {
    throw new AssertionError(
      message || `Object is missing properties: ${missing.join(', ')}`,
      { code: 'ASSERT_PROPERTIES_FAILED', details: { missing } },
    );
  }
}

export function invariant(condition, message, code = 'INVARIANT_VIOLATED') {
  if (!condition) {
    throw new AssertionError(message || 'Invariant violated', { code });
  }
}

export const ASSERT_CODES = Object.freeze({
  ASSERTION_FAILED: 'ASSERTION_FAILED',
  ASSERT_EQUAL_FAILED: 'ASSERT_EQUAL_FAILED',
  ASSERT_NOT_EQUAL_FAILED: 'ASSERT_NOT_EQUAL_FAILED',
  ASSERT_DEEP_EQUAL_FAILED: 'ASSERT_DEEP_EQUAL_FAILED',
  ASSERT_TRUTHY_FAILED: 'ASSERT_TRUTHY_FAILED',
  ASSERT_FALSY_FAILED: 'ASSERT_FALSY_FAILED',
  ASSERT_NOT_NULL_FAILED: 'ASSERT_NOT_NULL_FAILED',
  ASSERT_STRING_FAILED: 'ASSERT_STRING_FAILED',
  ASSERT_NUMBER_FAILED: 'ASSERT_NUMBER_FAILED',
  ASSERT_BOOLEAN_FAILED: 'ASSERT_BOOLEAN_FAILED',
  ASSERT_ARRAY_FAILED: 'ASSERT_ARRAY_FAILED',
  ASSERT_OBJECT_FAILED: 'ASSERT_OBJECT_FAILED',
  ASSERT_FUNCTION_FAILED: 'ASSERT_FUNCTION_FAILED',
  ASSERT_UUID_FAILED: 'ASSERT_UUID_FAILED',
  ASSERT_ISO_DATE_FAILED: 'ASSERT_ISO_DATE_FAILED',
  ASSERT_RANGE_FAILED: 'ASSERT_RANGE_FAILED',
  ASSERT_ONE_OF_FAILED: 'ASSERT_ONE_OF_FAILED',
  ASSERT_NOT_EMPTY_FAILED: 'ASSERT_NOT_EMPTY_FAILED',
  ASSERT_NO_THROW_FAILED: 'ASSERT_NO_THROW_FAILED',
  ASSERT_THROWS_FAILED: 'ASSERT_THROWS_FAILED',
  ASSERT_DEFINED_FAILED: 'ASSERT_DEFINED_FAILED',
  ASSERT_PROPERTY_FAILED: 'ASSERT_PROPERTY_FAILED',
  ASSERT_PROPERTIES_FAILED: 'ASSERT_PROPERTIES_FAILED',
  INVARIANT_VIOLATED: 'INVARIANT_VIOLATED',
});
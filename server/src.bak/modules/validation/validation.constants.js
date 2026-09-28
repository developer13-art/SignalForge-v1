/**
 * Signal Validation Constants
 *
 * @module signalforge/server/modules/validation/constants
 */

export const VALIDATION_EVENTS = Object.freeze({
  VALIDATION_STARTED: 'validation.started',
  VALIDATION_COMPLETED: 'validation.completed',
  VALIDATION_FAILED: 'validation.failed',
  VALIDATION_CHECK_PASSED: 'validation.check.passed',
  VALIDATION_CHECK_FAILED: 'validation.check.failed',
  DUPLICATE_DETECTED: 'validation.duplicate.detected',
  CONFLICT_DETECTED: 'validation.conflict.detected',
  SIGNAL_EXPIRED: 'validation.signal.expired',
  MARKET_CLOSED: 'validation.market.closed',
  SOURCE_UNTRUSTED: 'validation.source.untrusted',
});

export const VALIDATION_RESULTS = Object.freeze({
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  WARNING: 'WARNING',
  SKIPPED: 'SKIPPED',
});

export const VALIDATION_CHECK_NAMES = Object.freeze({
  SYMBOL: 'SYMBOL',
  DIRECTION: 'DIRECTION',
  PRICE: 'PRICE',
  EXPIRY: 'EXPIRY',
  COMPLETENESS: 'COMPLETENESS',
  SOURCE_TRUST: 'SOURCE_TRUST',
  MARKET_TRADABLE: 'MARKET_TRADABLE',
  ACCOUNT_PERMISSION: 'ACCOUNT_PERMISSION',
  SESSION: 'SESSION',
  DUPLICATE: 'DUPLICATE',
  CONFLICT: 'CONFLICT',
});

export const DEFAULT_EXPIRY_MINUTES = 30;
export const DEFAULT_MAX_SIGNAL_AGE_MINUTES = 30;
export const DEFAULT_MIN_SOURCE_TRUST = 0.5;
export const DEFAULT_DUPLICATE_WINDOW_MINUTES = 5;
export const DEFAULT_CONFLICT_WINDOW_MINUTES = 10;

export const TRADING_SESSIONS = Object.freeze({
  SYDNEY: { open: '22:00', close: '07:00' },
  TOKYO: { open: '00:00', close: '09:00' },
  LONDON: { open: '08:00', close: '17:00' },
  NEW_YORK: { open: '13:00', close: '22:00' },
});

export const MARKET_CLOSED_DAYS = Object.freeze([6]);

export const FAILED_CHECK_SEVERITY = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
});

export const CHECK_SEVERITY_MAP = Object.freeze({
  SYMBOL: FAILED_CHECK_SEVERITY.CRITICAL,
  DIRECTION: FAILED_CHECK_SEVERITY.CRITICAL,
  PRICE: FAILED_CHECK_SEVERITY.HIGH,
  COMPLETENESS: FAILED_CHECK_SEVERITY.HIGH,
  EXPIRY: FAILED_CHECK_SEVERITY.HIGH,
  MARKET_TRADABLE: FAILED_CHECK_SEVERITY.HIGH,
  DUPLICATE: FAILED_CHECK_SEVERITY.HIGH,
  CONFLICT: FAILED_CHECK_SEVERITY.MEDIUM,
  SOURCE_TRUST: FAILED_CHECK_SEVERITY.MEDIUM,
  ACCOUNT_PERMISSION: FAILED_CHECK_SEVERITY.HIGH,
  SESSION: FAILED_CHECK_SEVERITY.MEDIUM,
});

export function isValidCheckName(name) {
  return Object.values(VALIDATION_CHECK_NAMES).includes(name);
}

export function getCheckSeverity(name) {
  return CHECK_SEVERITY_MAP[name] || FAILED_CHECK_SEVERITY.MEDIUM;
}
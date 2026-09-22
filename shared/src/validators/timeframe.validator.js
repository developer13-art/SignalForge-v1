/**
 * Timeframe Validator
 *
 * Provides validation and normalization for trading timeframes used
 * across SignalForge signal parsing, analysis, and filtering.
 *
 * @module @signalforge/shared/validators/timeframe
 */

export const TIMEFRAMES = Object.freeze({
  M1: 'M1',
  M5: 'M5',
  M15: 'M15',
  M30: 'M30',
  H1: 'H1',
  H4: 'H4',
  D1: 'D1',
  W1: 'W1',
  MN1: 'MN1',
});

export const TIMEFRAME_VALUES = Object.freeze(Object.values(TIMEFRAMES));

export const TIMEFRAME_MINUTES = Object.freeze({
  M1: 1,
  M5: 5,
  M15: 15,
  M30: 30,
  H1: 60,
  H4: 240,
  D1: 1440,
  W1: 10080,
  MN1: 43200,
});

const TIMEFRAME_ALIASES = Object.freeze({
  '1M': 'M1',
  '1MIN': 'M1',
  '1MINUTE': 'M1',
  '5M': 'M5',
  '5MIN': 'M5',
  '5MINUTE': 'M5',
  '15M': 'M15',
  '15MIN': 'M15',
  '30M': 'M30',
  '30MIN': 'M30',
  '1H': 'H1',
  H1: 'H1',
  '1HOUR': 'H1',
  '60M': 'H1',
  '4H': 'H4',
  H4: 'H4',
  '4HOUR': 'H4',
  '240M': 'H4',
  '1D': 'D1',
  D1: 'D1',
  '1DAY': 'D1',
  'DAILY': 'D1',
  '1W': 'W1',
  W1: 'W1',
  '1WEEK': 'W1',
  'WEEKLY': 'W1',
  '1MO': 'MN1',
  MN1: 'MN1',
  'MONTHLY': 'MN1',
});

export function normalizeTimeframe(timeframe) {
  if (!timeframe || typeof timeframe !== 'string') {
    return null;
  }

  const cleaned = timeframe.trim().toUpperCase();

  if (TIMEFRAME_VALUES.includes(cleaned)) {
    return cleaned;
  }

  if (TIMEFRAME_ALIASES[cleaned]) {
    return TIMEFRAME_ALIASES[cleaned];
  }

  return null;
}

export function isValidTimeframe(timeframe) {
  return normalizeTimeframe(timeframe) !== null;
}

export function validateTimeframe(timeframe, options = {}) {
  const errors = [];

  if (!timeframe || typeof timeframe !== 'string') {
    return { valid: false, errors: ['Timeframe is required'] };
  }

  const normalized = normalizeTimeframe(timeframe);

  if (!normalized) {
    return {
      valid: false,
      errors: [`Timeframe "${timeframe}" is not recognized`],
    };
  }

  if (options.allowedTimeframes && Array.isArray(options.allowedTimeframes)) {
    if (!options.allowedTimeframes.includes(normalized)) {
      errors.push(`Timeframe ${normalized} is not in the allowed list`);
    }
  }

  return { valid: errors.length === 0, errors, normalized };
}

export function getTimeframeMinutes(timeframe) {
  const normalized = normalizeTimeframe(timeframe);
  if (!normalized) {
    return null;
  }
  return TIMEFRAME_MINUTES[normalized];
}

export function isHigherTimeframe(timeframe, than) {
  const minutes = getTimeframeMinutes(timeframe);
  const thanMinutes = getTimeframeMinutes(than);
  if (minutes === null || thanMinutes === null) {
    return false;
  }
  return minutes > thanMinutes;
}

export function isLowerTimeframe(timeframe, than) {
  const minutes = getTimeframeMinutes(timeframe);
  const thanMinutes = getTimeframeMinutes(than);
  if (minutes === null || thanMinutes === null) {
    return false;
  }
  return minutes < thanMinutes;
}

export const TIMEFRAME_CONSTRAINTS = Object.freeze({
  supported: TIMEFRAME_VALUES,
  aliasCount: Object.keys(TIMEFRAME_ALIASES).length,
});
/**
 * Trade Shadow Module Constants
 *
 * @module signalforge/server/modules/trade-shadow/constants
 */

export const SHADOW_EVENTS = Object.freeze({
  SHADOW_CREATED: 'trade_shadow.created',
  SHADOW_UPDATED: 'trade_shadow.updated',
  SHADOW_COMPLETED: 'trade_shadow.completed',
  DIVERGENCE_DETECTED: 'trade_shadow.divergence.detected',
  MISSED_PROFIT_DETECTED: 'trade_shadow.missed_profit.detected',
  BETTER_EXIT_DETECTED: 'trade_shadow.better_exit.detected',
  BEHAVIOR_FEEDBACK_GENERATED: 'trade_shadow.behavior_feedback.generated',
});

export const SHADOW_OUTCOMES = Object.freeze({
  PENDING: 'PENDING',
  USER_BETTER: 'USER_BETTER',
  PROVIDER_BETTER: 'PROVIDER_BETTER',
  EQUAL: 'EQUAL',
  INCONCLUSIVE: 'INCONCLUSIVE',
  ERROR: 'ERROR',
});

export const SHADOW_OUTCOME_VALUES = Object.freeze(Object.values(SHADOW_OUTCOMES));

export const DIVERGENCE_TYPES = Object.freeze({
  EARLY_EXIT: 'EARLY_EXIT',
  LATE_EXIT: 'LATE_EXIT',
  DIFFERENT_PRICE: 'DIFFERENT_PRICE',
  PARTIAL_CLOSE_DIFF: 'PARTIAL_CLOSE_DIFF',
  STOP_LOSS_MOVED: 'STOP_LOSS_MOVED',
  TAKE_PROFIT_MOVED: 'TAKE_PROFIT_MOVED',
  MANUAL_INTERVENTION: 'MANUAL_INTERVENTION',
  FORCED_CLOSE: 'FORCED_CLOSE',
});

export const DIVERGENCE_TYPE_VALUES = Object.freeze(Object.values(DIVERGENCE_TYPES));

export const BEHAVIOR_CATEGORIES = Object.freeze({
  DISCIPLINED: 'DISCIPLINED',
  IMPULSIVE: 'IMPULSIVE',
  PATIENT: 'PATIENT',
  AGGRESSIVE: 'AGGRESSIVE',
  CONSERVATIVE: 'CONSERVATIVE',
  RECKLESS: 'RECKLESS',
  CONSISTENT: 'CONSISTENT',
  ERRATIC: 'ERRATIC',
});

export const DEFAULT_DIVERGENCE_THRESHOLD_PIPS = 5;
export const DEFAULT_MISSED_PROFIT_THRESHOLD = 10;
export const DEFAULT_BETTER_EXIT_THRESHOLD = 10;
export const MAX_SHADOW_RECORDS_PER_USER = 10000;

export function isValidShadowOutcome(outcome) {
  return SHADOW_OUTCOME_VALUES.includes(outcome);
}

export function isValidDivergenceType(type) {
  return DIVERGENCE_TYPE_VALUES.includes(type);
}
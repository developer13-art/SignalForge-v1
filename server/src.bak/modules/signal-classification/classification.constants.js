/**
 * Signal Classification Constants
 *
 * @module signalforge/server/modules/signal-classification/constants
 */

export const CLASSIFICATION_EVENTS = Object.freeze({
  CLASSIFICATION_STARTED: 'classification.started',
  CLASSIFICATION_COMPLETED: 'classification.completed',
  CLASSIFICATION_FAILED: 'classification.failed',
  CLASSIFICATION_UNCERTAIN: 'classification.uncertain',
  CLASSIFIER_THRESHOLD_HIT: 'classification.threshold_hit',
});

export const CLASSIFICATION_TYPES = Object.freeze({
  NEW_TRADE: 'NEW_TRADE',
  TRADE_MANAGEMENT: 'TRADE_MANAGEMENT',
  MARKET_ANALYSIS: 'MARKET_ANALYSIS',
  NEWS: 'NEWS',
  EDUCATION: 'EDUCATION',
  ADVERTISEMENT: 'ADVERTISEMENT',
  CONVERSATION: 'CONVERSATION',
  UNKNOWN: 'UNKNOWN',
});

export const CLASSIFICATION_TYPE_VALUES = Object.freeze(
  Object.values(CLASSIFICATION_TYPES),
);

export const EXECUTABLE_CLASSIFICATIONS = Object.freeze([
  CLASSIFICATION_TYPES.NEW_TRADE,
  CLASSIFICATION_TYPES.TRADE_MANAGEMENT,
]);

export const NON_EXECUTABLE_CLASSIFICATIONS = Object.freeze([
  CLASSIFICATION_TYPES.MARKET_ANALYSIS,
  CLASSIFICATION_TYPES.NEWS,
  CLASSIFICATION_TYPES.EDUCATION,
  CLASSIFICATION_TYPES.ADVERTISEMENT,
  CLASSIFICATION_TYPES.CONVERSATION,
  CLASSIFICATION_TYPES.UNKNOWN,
]);

export const CLASSIFIER_KINDS = Object.freeze({
  RULE_BASED: 'RULE_BASED',
  AI: 'AI',
  HYBRID: 'HYBRID',
  MANUAL: 'MANUAL',
});

export const DEFAULT_CLASSIFIER_KIND = CLASSIFIER_KINDS.HYBRID;

export const DEFAULT_MIN_CONFIDENCE = 0.7;
export const DEFAULT_HIGH_CONFIDENCE = 0.9;
export const DEFAULT_LOW_CONFIDENCE = 0.5;

export const DEFAULT_RULE_BASED_THRESHOLD = 0.6;
export const DEFAULT_AI_THRESHOLD = 0.5;

export const MAX_MESSAGE_LENGTH_FOR_CLASSIFICATION = 8000;
export const CLASSIFICATION_TIMEOUT_MS = 15000;

export function isExecutable(classification) {
  return EXECUTABLE_CLASSIFICATIONS.includes(classification);
}

export function isNonExecutable(classification) {
  return NON_EXECUTABLE_CLASSIFICATIONS.includes(classification);
}

export function isValidClassification(classification) {
  return CLASSIFICATION_TYPE_VALUES.includes(classification);
}
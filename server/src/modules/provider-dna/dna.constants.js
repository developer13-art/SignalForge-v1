/**
 * Provider DNA Constants
 *
 * @module signalforge/server/modules/provider-dna/constants
 */

export const DNA_EVENTS = Object.freeze({
  DNA_CREATED: 'provider_dna.created',
  DNA_UPDATED: 'provider_dna.updated',
  DNA_VERSION_CREATED: 'provider_dna.version.created',
  DNA_RULE_CREATED: 'provider_dna.rule.created',
  DNA_RULE_UPDATED: 'provider_dna.rule.updated',
  DNA_RULE_DELETED: 'provider_dna.rule.deleted',
  DNA_LEARNING_STARTED: 'provider_dna.learning.started',
  DNA_LEARNING_COMPLETED: 'provider_dna.learning.completed',
  DNA_LEARNING_FAILED: 'provider_dna.learning.failed',
  DNA_FAST_PATH_HIT: 'provider_dna.fast_path.hit',
  DNA_FAST_PATH_MISS: 'provider_dna.fast_path.miss',
  DNA_REINFORCEMENT_APPLIED: 'provider_dna.reinforcement.applied',
  DNA_PROFILE_UPDATED: 'provider_dna.profile.updated',
  DNA_TEST_COMPLETED: 'provider_dna.test.completed',
});

export const DNA_RULE_TYPES = Object.freeze({
  SYMBOL_MAPPING: 'SYMBOL_MAPPING',
  DIRECTION_MAPPING: 'DIRECTION_MAPPING',
  ENTRY_PATTERN: 'ENTRY_PATTERN',
  STOP_LOSS_PATTERN: 'STOP_LOSS_PATTERN',
  TAKE_PROFIT_PATTERN: 'TAKE_PROFIT_PATTERN',
  MANAGEMENT_INSTRUCTION: 'MANAGEMENT_INSTRUCTION',
  ABBREVIATION: 'ABBREVIATION',
  RISK_PATTERN: 'RISK_PATTERN',
  TIMEFRAME_MAPPING: 'TIMEFRAME_MAPPING',
  LANGUAGE_HINT: 'LANGUAGE_HINT',
});

export const DNA_RULE_TYPE_VALUES = Object.freeze(Object.values(DNA_RULE_TYPES));

export const DNA_MATCH_TYPES = Object.freeze({
  EXACT: 'EXACT',
  CONTAINS: 'CONTAINS',
  REGEX: 'REGEX',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
});

export const DNA_MATCH_TYPE_VALUES = Object.freeze(Object.values(DNA_MATCH_TYPES));

export const DNA_PATHS = Object.freeze({
  FAST_PATH: 'FAST_PATH',
  LEARNING_PATH: 'LEARNING_PATH',
  UNKNOWN: 'UNKNOWN',
});

export const DNA_PROFILE_SECTIONS = Object.freeze({
  LANGUAGE: 'language',
  SYMBOL: 'symbol',
  RISK: 'risk',
  MANAGEMENT: 'management',
  RELIABILITY: 'reliability',
});

export const DEFAULT_FAST_PATH_MIN_CONFIDENCE = 0.9;
export const DEFAULT_LEARNING_PATH_MIN_CONFIDENCE = 0.6;
export const DEFAULT_DNA_CONFIDENCE = 0.5;
export const DEFAULT_RULE_PRIORITY = 100;
export const DEFAULT_AUTO_LEARN_THRESHOLD = 5;
export const MAX_RULE_USAGE_MULTIPLIER = 3;
export const MIN_RULE_USAGE_FOR_PROMOTION = 5;
export const MIN_RULE_SUCCESS_RATE = 0.85;
export const DNA_VERSION_RETENTION = 20;

export function isValidRuleType(type) {
  return DNA_RULE_TYPE_VALUES.includes(type);
}

export function isValidMatchType(type) {
  return DNA_MATCH_TYPE_VALUES.includes(type);
}
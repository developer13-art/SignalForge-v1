/**
 * Provider DNA Constants
 *
 * @module signalforge/server/modules/provider-dna/constants
 */
const DNA_EVENTS = Object.freeze({
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
const DNA_RULE_TYPES = Object.freeze({
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
const DNA_RULE_TYPE_VALUES = Object.freeze(Object.values(DNA_RULE_TYPES));
const DNA_MATCH_TYPES = Object.freeze({
  EXACT: 'EXACT',
  CONTAINS: 'CONTAINS',
  REGEX: 'REGEX',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
});
const DNA_MATCH_TYPE_VALUES = Object.freeze(Object.values(DNA_MATCH_TYPES));
const DNA_PATHS = Object.freeze({
  FAST_PATH: 'FAST_PATH',
  LEARNING_PATH: 'LEARNING_PATH',
  UNKNOWN: 'UNKNOWN',
});
const DNA_PROFILE_SECTIONS = Object.freeze({
  LANGUAGE: 'language',
  SYMBOL: 'symbol',
  RISK: 'risk',
  MANAGEMENT: 'management',
  RELIABILITY: 'reliability',
});
const DEFAULT_FAST_PATH_MIN_CONFIDENCE = 0.9;
const DEFAULT_LEARNING_PATH_MIN_CONFIDENCE = 0.6;
const DEFAULT_DNA_CONFIDENCE = 0.5;
const DEFAULT_RULE_PRIORITY = 100;
const DEFAULT_AUTO_LEARN_THRESHOLD = 5;
const MAX_RULE_USAGE_MULTIPLIER = 3;
const MIN_RULE_USAGE_FOR_PROMOTION = 5;
const MIN_RULE_SUCCESS_RATE = 0.85;
const DNA_VERSION_RETENTION = 20;
function isValidRuleType(type) {
  return DNA_RULE_TYPE_VALUES.includes(type);
}
function isValidMatchType(type) {
  return DNA_MATCH_TYPE_VALUES.includes(type);
}
module.exports.DNA_EVENTS = DNA_EVENTS;
module.exports.DNA_RULE_TYPES = DNA_RULE_TYPES;
module.exports.DNA_RULE_TYPE_VALUES = DNA_RULE_TYPE_VALUES;
module.exports.DNA_MATCH_TYPES = DNA_MATCH_TYPES;
module.exports.DNA_MATCH_TYPE_VALUES = DNA_MATCH_TYPE_VALUES;
module.exports.DNA_PATHS = DNA_PATHS;
module.exports.DNA_PROFILE_SECTIONS = DNA_PROFILE_SECTIONS;
module.exports.DEFAULT_FAST_PATH_MIN_CONFIDENCE = DEFAULT_FAST_PATH_MIN_CONFIDENCE;
module.exports.DEFAULT_LEARNING_PATH_MIN_CONFIDENCE = DEFAULT_LEARNING_PATH_MIN_CONFIDENCE;
module.exports.DEFAULT_DNA_CONFIDENCE = DEFAULT_DNA_CONFIDENCE;
module.exports.DEFAULT_RULE_PRIORITY = DEFAULT_RULE_PRIORITY;
module.exports.DEFAULT_AUTO_LEARN_THRESHOLD = DEFAULT_AUTO_LEARN_THRESHOLD;
module.exports.MAX_RULE_USAGE_MULTIPLIER = MAX_RULE_USAGE_MULTIPLIER;
module.exports.MIN_RULE_USAGE_FOR_PROMOTION = MIN_RULE_USAGE_FOR_PROMOTION;
module.exports.MIN_RULE_SUCCESS_RATE = MIN_RULE_SUCCESS_RATE;
module.exports.DNA_VERSION_RETENTION = DNA_VERSION_RETENTION;
module.exports.isValidRuleType = isValidRuleType;
module.exports.isValidMatchType = isValidMatchType;

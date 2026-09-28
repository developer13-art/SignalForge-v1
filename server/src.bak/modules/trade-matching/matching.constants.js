/**
 * Trade Matching Constants
 *
 * @module signalforge/server/modules/trade-matching/constants
 */

export const MATCHING_EVENTS = Object.freeze({
  MATCH_ATTEMPTED: 'trade_matching.attempted',
  MATCH_SUCCEEDED: 'trade_matching.succeeded',
  MATCH_FAILED: 'trade_matching.failed',
  MATCH_AMBIGUOUS: 'trade_matching.ambiguous',
  MANAGEMENT_INSTRUCTION_PARSED: 'trade_matching.instruction.parsed',
  MANAGEMENT_INSTRUCTION_APPLIED: 'trade_matching.instruction.applied',
  MANAGEMENT_INSTRUCTION_FAILED: 'trade_matching.instruction.failed',
});

export const MATCH_STRATEGIES = Object.freeze({
  TICKET: 'TICKET',
  REPLY_REFERENCE: 'REPLY_REFERENCE',
  SYMBOL_TIME: 'SYMBOL_TIME',
  SYMBOL_ONLY: 'SYMBOL_ONLY',
  PROVIDER_RECENT: 'PROVIDER_RECENT',
  HYBRID: 'HYBRID',
});

export const MATCH_STRATEGY_VALUES = Object.freeze(Object.values(MATCH_STRATEGIES));

export const MATCH_OUTCOMES = Object.freeze({
  MATCHED: 'MATCHED',
  NO_MATCH: 'NO_MATCH',
  AMBIGUOUS: 'AMBIGUOUS',
  MULTIPLE: 'MULTIPLE',
  ERROR: 'ERROR',
});

export const MANAGEMENT_INSTRUCTION_TYPES = Object.freeze({
  CLOSE_HALF: 'CLOSE_HALF',
  CLOSE_SOME: 'CLOSE_SOME',
  CLOSE_ALL: 'CLOSE_ALL',
  CLOSE_POSITION: 'CLOSE_POSITION',
  MOVE_SL_BREAKEVEN: 'MOVE_SL_BREAKEVEN',
  MOVE_SL: 'MOVE_SL',
  MOVE_TP: 'MOVE_TP',
  TRAILING_STOP: 'TRAILING_STOP',
  PARTIAL_CLOSE: 'PARTIAL_CLOSE',
  SECURE_PROFIT: 'SECURE_PROFIT',
  LOCK_PROFIT: 'LOCK_PROFIT',
  CANCEL_ORDER: 'CANCEL_ORDER',
  UNKNOWN: 'UNKNOWN',
});

export const MANAGEMENT_INSTRUCTION_VALUES = Object.freeze(
  Object.values(MANAGEMENT_INSTRUCTION_TYPES),
);

export const DEFAULT_TIME_WINDOW_MINUTES = 30;
export const DEFAULT_TIME_WINDOW_MS = DEFAULT_TIME_WINDOW_MINUTES * 60 * 1000;

export const DEFAULT_SYMBOL_WEIGHT = 0.4;
export const DEFAULT_TIME_WEIGHT = 0.3;
export const DEFAULT_PROVIDER_WEIGHT = 0.2;
export const DEFAULT_REPLY_WEIGHT = 0.4;
export const DEFAULT_TICKET_WEIGHT = 1.0;

export const MIN_MATCH_CONFIDENCE = 0.6;
export const HIGH_MATCH_CONFIDENCE = 0.85;
export const AMBIGUITY_MARGIN = 0.1;

export const MAX_OPEN_TRADES_TO_SCAN = 200;

export function isValidMatchStrategy(strategy) {
  return MATCH_STRATEGY_VALUES.includes(strategy);
}

export function isValidManagementInstruction(type) {
  return MANAGEMENT_INSTRUCTION_VALUES.includes(type);
}
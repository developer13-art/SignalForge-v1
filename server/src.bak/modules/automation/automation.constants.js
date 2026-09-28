/**
 * Automation Module Constants
 *
 * @module signalforge/server/modules/automation/constants
 */

export const AUTOMATION_EVENTS = Object.freeze({
  RULE_CREATED: 'automation.rule.created',
  RULE_UPDATED: 'automation.rule.updated',
  RULE_DELETED: 'automation.rule.deleted',
  RULE_ENABLED: 'automation.rule.enabled',
  RULE_DISABLED: 'automation.rule.disabled',
  RULE_TRIGGERED: 'automation.rule.triggered',
  RULE_MATCHED: 'automation.rule.matched',
  RULE_EXECUTED: 'automation.rule.executed',
  RULE_FAILED: 'automation.rule.failed',
  EVALUATION_STARTED: 'automation.evaluation.started',
  EVALUATION_COMPLETED: 'automation.evaluation.completed',
});

export const AUTOMATION_CONDITION_TYPES = Object.freeze({
  PROFIT_GREATER_THAN: 'PROFIT_GREATER_THAN',
  PROFIT_LESS_THAN: 'PROFIT_LESS_THAN',
  PROFIT_PERCENT_GREATER_THAN: 'PROFIT_PERCENT_GREATER_THAN',
  CONFIDENCE_GREATER_OR_EQUAL: 'CONFIDENCE_GREATER_OR_EQUAL',
  CONFIDENCE_LESS_THAN: 'CONFIDENCE_LESS_THAN',
  PROVIDER_IS: 'PROVIDER_IS',
  PROVIDER_CLOSES: 'PROVIDER_CLOSES',
  SYMBOL_IS: 'SYMBOL_IS',
  SYMBOL_IN: 'SYMBOL_IN',
  DIRECTION_IS: 'DIRECTION_IS',
  SESSION_IS: 'SESSION_IS',
  TIME_AFTER: 'TIME_AFTER',
  TIME_BEFORE: 'TIME_BEFORE',
  DRAWDOWN_GREATER_THAN: 'DRAWDOWN_GREATER_THAN',
  OPEN_TRADES_GREATER_THAN: 'OPEN_TRADES_GREATER_THAN',
  TRADE_DURATION_GREATER_THAN: 'TRADE_DURATION_GREATER_THAN',
  RISK_PERCENT_GREATER_THAN: 'RISK_PERCENT_GREATER_THAN',
});

export const AUTOMATION_CONDITION_VALUES = Object.freeze(
  Object.values(AUTOMATION_CONDITION_TYPES),
);

export const AUTOMATION_ACTION_TYPES = Object.freeze({
  MOVE_STOP_LOSS_TO_BREAK_EVEN: 'MOVE_STOP_LOSS_TO_BREAK_EVEN',
  MOVE_STOP_LOSS_TO: 'MOVE_STOP_LOSS_TO',
  TRAILING_STOP_ENABLE: 'TRAILING_STOP_ENABLE',
  TRAILING_STOP_DISABLE: 'TRAILING_STOP_DISABLE',
  PARTIAL_CLOSE: 'PARTIAL_CLOSE',
  CLOSE_POSITION: 'CLOSE_POSITION',
  CLOSE_ALL_POSITIONS: 'CLOSE_ALL_POSITIONS',
  SKIP_SIGNAL: 'SKIP_SIGNAL',
  EXECUTE_SIGNAL: 'EXECUTE_SIGNAL',
  LOCK_PROFIT: 'LOCK_PROFIT',
  SET_TAKE_PROFIT: 'SET_TAKE_PROFIT',
  NOTIFY_USER: 'NOTIFY_USER',
});

export const AUTOMATION_ACTION_VALUES = Object.freeze(
  Object.values(AUTOMATION_ACTION_TYPES),
);

export const AUTOMATION_RULE_SCOPES = Object.freeze({
  GLOBAL: 'GLOBAL',
  PROVIDER: 'PROVIDER',
  SYMBOL: 'SYMBOL',
  RISK_PROFILE: 'RISK_PROFILE',
});

export const AUTOMATION_RULE_SCOPE_VALUES = Object.freeze(
  Object.values(AUTOMATION_RULE_SCOPES),
);

export const DEFAULT_RULE_PRIORITY = 100;
export const MIN_RULE_PRIORITY = 0;
export const MAX_RULE_PRIORITY = 1000;
export const DEFAULT_RULE_ENABLED = true;
export const DEFAULT_STOP_ON_MATCH = false;

export const EVALUATION_TIMEOUT_MS = 10000;
export const MAX_RULES_PER_USER = 500;

export function isValidConditionType(type) {
  return AUTOMATION_CONDITION_VALUES.includes(type);
}

export function isValidActionType(type) {
  return AUTOMATION_ACTION_VALUES.includes(type);
}

export function isValidRuleScope(scope) {
  return AUTOMATION_RULE_SCOPE_VALUES.includes(scope);
}
/**
 * Automation Rule Schema
 *
 * Defines the structure of an automation rule. Rules are expressed as
 * IF/THEN logic and run after risk approval and before execution.
 *
 * @module @signalforge/shared/schemas/automation-rule
 */

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

export const AUTOMATION_CONDITION_TYPE_VALUES = Object.freeze(
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

export const AUTOMATION_ACTION_TYPE_VALUES = Object.freeze(
  Object.values(AUTOMATION_ACTION_TYPES),
);

export const AUTOMATION_RULE_SCHEMA = Object.freeze({
  type: 'object',
  required: ['ruleId', 'userId', 'name', 'condition', 'action', 'enabled'],
  properties: {
    ruleId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 1, maxLength: 128 },
    description: { type: 'string', nullable: true, maxLength: 512 },
    scope: {
      type: 'string',
      enum: ['GLOBAL', 'PROVIDER', 'SYMBOL', 'RISK_PROFILE'],
      default: 'GLOBAL',
    },
    providerId: { type: 'string', format: 'uuid', nullable: true },
    symbol: { type: 'string', nullable: true, maxLength: 32 },
    condition: {
      type: 'object',
      required: ['type'],
      properties: {
        type: { type: 'string', enum: AUTOMATION_CONDITION_TYPE_VALUES },
        operator: { type: 'string', nullable: true },
        value: {},
        value2: {},
        metadata: { type: 'object', nullable: true },
      },
    },
    action: {
      type: 'object',
      required: ['type'],
      properties: {
        type: { type: 'string', enum: AUTOMATION_ACTION_TYPE_VALUES },
        parameters: { type: 'object', nullable: true },
        metadata: { type: 'object', nullable: true },
      },
    },
    priority: { type: 'number', minimum: 0, default: 100 },
    enabled: { type: 'boolean', default: true },
    stopOnMatch: { type: 'boolean', default: false },
    createdAt: { type: 'string', format: 'date-time', nullable: true },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildAutomationRule(input) {
  return {
    ruleId: input.ruleId,
    userId: input.userId,
    name: input.name,
    description: input.description || null,
    scope: input.scope || 'GLOBAL',
    providerId: input.providerId || null,
    symbol: input.symbol || null,
    condition: input.condition,
    action: input.action,
    priority: input.priority ?? 100,
    enabled: input.enabled ?? true,
    stopOnMatch: input.stopOnMatch ?? false,
    createdAt: input.createdAt || null,
    updatedAt: input.updatedAt || null,
    metadata: input.metadata || null,
  };
}

export function validateAutomationRule(rule) {
  const errors = [];

  if (!rule || typeof rule !== 'object') {
    return { valid: false, errors: ['Rule must be an object'] };
  }

  for (const field of AUTOMATION_RULE_SCHEMA.required) {
    if (rule[field] === undefined || rule[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (rule.condition && !AUTOMATION_CONDITION_TYPE_VALUES.includes(rule.condition.type)) {
    errors.push(`Invalid condition type: ${rule.condition.type}`);
  }

  if (rule.action && !AUTOMATION_ACTION_TYPE_VALUES.includes(rule.action.type)) {
    errors.push(`Invalid action type: ${rule.action.type}`);
  }

  return { valid: errors.length === 0, errors };
}

export const AUTOMATION_RULE_FIELDS = Object.freeze(
  Object.keys(AUTOMATION_RULE_SCHEMA.properties),
);
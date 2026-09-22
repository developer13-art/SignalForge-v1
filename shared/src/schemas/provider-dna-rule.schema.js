/**
 * Provider DNA Rule Schema
 *
 * Defines the structure of a Provider DNA rule. Rules map provider-specific
 * language patterns to standardized trade instructions so the platform
 * can interpret messages without full AI inference each time (Fast Path).
 *
 * @module @signalforge/shared/schemas/provider-dna-rule
 */

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

export const DNA_RULE_MATCH_TYPES = Object.freeze({
  EXACT: 'EXACT',
  CONTAINS: 'CONTAINS',
  REGEX: 'REGEX',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
});

export const DNA_RULE_MATCH_TYPE_VALUES = Object.freeze(
  Object.values(DNA_RULE_MATCH_TYPES),
);

export const PROVIDER_DNA_RULE_SCHEMA = Object.freeze({
  type: 'object',
  required: ['ruleId', 'providerId', 'ruleType', 'pattern', 'action'],
  properties: {
    ruleId: { type: 'string', format: 'uuid' },
    providerId: { type: 'string', format: 'uuid' },
    dnaVersionId: { type: 'string', format: 'uuid', nullable: true },
    ruleType: { type: 'string', enum: DNA_RULE_TYPE_VALUES },
    matchType: { type: 'string', enum: DNA_RULE_MATCH_TYPE_VALUES, default: 'CONTAINS' },
    pattern: { type: 'string', minLength: 1, maxLength: 512 },
    caseSensitive: { type: 'boolean', default: false },
    priority: { type: 'number', minimum: 0, default: 100 },
    action: {
      type: 'object',
      required: ['type'],
      properties: {
        type: { type: 'string' },
        value: {},
        parameters: { type: 'object', nullable: true },
      },
    },
    confidence: { type: 'number', minimum: 0, maximum: 1, default: 1 },
    usageCount: { type: 'number', minimum: 0, default: 0 },
    successCount: { type: 'number', minimum: 0, default: 0 },
    lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
    enabled: { type: 'boolean', default: true },
    createdAt: { type: 'string', format: 'date-time', nullable: true },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
    metadata: { type: 'object', nullable: true },
  },
  additionalProperties: false,
});

export function buildProviderDnaRule(input) {
  return {
    ruleId: input.ruleId,
    providerId: input.providerId,
    dnaVersionId: input.dnaVersionId || null,
    ruleType: input.ruleType,
    matchType: input.matchType || 'CONTAINS',
    pattern: input.pattern,
    caseSensitive: input.caseSensitive ?? false,
    priority: input.priority ?? 100,
    action: input.action,
    confidence: input.confidence ?? 1,
    usageCount: input.usageCount ?? 0,
    successCount: input.successCount ?? 0,
    lastUsedAt: input.lastUsedAt || null,
    enabled: input.enabled ?? true,
    createdAt: input.createdAt || null,
    updatedAt: input.updatedAt || null,
    metadata: input.metadata || null,
  };
}

export function validateProviderDnaRule(rule) {
  const errors = [];

  if (!rule || typeof rule !== 'object') {
    return { valid: false, errors: ['Rule must be an object'] };
  }

  for (const field of PROVIDER_DNA_RULE_SCHEMA.required) {
    if (rule[field] === undefined || rule[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (rule.ruleType && !DNA_RULE_TYPE_VALUES.includes(rule.ruleType)) {
    errors.push(`Invalid ruleType: ${rule.ruleType}`);
  }

  if (rule.matchType && !DNA_RULE_MATCH_TYPE_VALUES.includes(rule.matchType)) {
    errors.push(`Invalid matchType: ${rule.matchType}`);
  }

  if (rule.matchType === 'REGEX' && rule.pattern) {
    try {
      new RegExp(rule.pattern);
    } catch (err) {
      errors.push(`Invalid regex pattern: ${err.message}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function matchesDnaRule(rule, text) {
  if (!rule || !text) {
    return false;
  }

  const haystack = rule.caseSensitive ? text : text.toLowerCase();
  const needle = rule.caseSensitive ? rule.pattern : rule.pattern.toLowerCase();

  switch (rule.matchType) {
    case 'EXACT':
      return haystack === needle;
    case 'CONTAINS':
      return haystack.includes(needle);
    case 'STARTS_WITH':
      return haystack.startsWith(needle);
    case 'ENDS_WITH':
      return haystack.endsWith(needle);
    case 'REGEX': {
      const flags = rule.caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(rule.pattern, flags);
      return regex.test(text);
    }
    default:
      return false;
  }
}

export const PROVIDER_DNA_RULE_FIELDS = Object.freeze(
  Object.keys(PROVIDER_DNA_RULE_SCHEMA.properties),
);
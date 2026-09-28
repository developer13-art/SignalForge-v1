/**
 * DNA Rule Validator
 *
 * @module signalforge/server/modules/provider-dna/rules/validator
 */

import {
  DNA_RULE_TYPE_VALUES,
  DNA_MATCH_TYPE_VALUES,
  DNA_RULE_TYPES,
} from '../dna.constants.js';

export function validateRuleCreatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.ruleType || typeof body.ruleType !== 'string') {
    errors.push('ruleType is required');
  } else if (!DNA_RULE_TYPE_VALUES.includes(body.ruleType)) {
    errors.push(`ruleType must be one of: ${DNA_RULE_TYPE_VALUES.join(', ')}`);
  }

  if (body.matchType !== undefined) {
    if (!DNA_MATCH_TYPE_VALUES.includes(body.matchType)) {
      errors.push(`matchType must be one of: ${DNA_MATCH_TYPE_VALUES.join(', ')}`);
    }
  }

  if (!body.pattern || typeof body.pattern !== 'string') {
    errors.push('pattern is required');
  } else if (body.pattern.length > 512) {
    errors.push('pattern must not exceed 512 characters');
  } else if (body.matchType === 'REGEX') {
    try {
      new RegExp(body.pattern);
    } catch (err) {
      errors.push(`pattern is not a valid regex: ${err.message}`);
    }
  }

  if (!body.action || typeof body.action !== 'object') {
    errors.push('action must be an object');
  } else if (!body.action.type) {
    errors.push('action.type is required');
  }

  if (body.priority !== undefined) {
    if (typeof body.priority !== 'number' || body.priority < 0 || body.priority > 1000) {
      errors.push('priority must be between 0 and 1000');
    }
  }

  if (body.confidence !== undefined) {
    if (typeof body.confidence !== 'number' || body.confidence < 0 || body.confidence > 1) {
      errors.push('confidence must be between 0 and 1');
    }
  }

  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateRuleUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.matchType !== undefined && !DNA_MATCH_TYPE_VALUES.includes(body.matchType)) {
    errors.push(`matchType must be one of: ${DNA_MATCH_TYPE_VALUES.join(', ')}`);
  }

  if (body.pattern !== undefined) {
    if (typeof body.pattern !== 'string' || body.pattern.length > 512) {
      errors.push('pattern must not exceed 512 characters');
    }
  }

  if (body.priority !== undefined) {
    if (typeof body.priority !== 'number' || body.priority < 0 || body.priority > 1000) {
      errors.push('priority must be between 0 and 1000');
    }
  }

  if (body.confidence !== undefined) {
    if (typeof body.confidence !== 'number' || body.confidence < 0 || body.confidence > 1) {
      errors.push('confidence must be between 0 and 1');
    }
  }

  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateDnaTestPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.text || typeof body.text !== 'string') {
    errors.push('text is required');
  } else if (body.text.length > 8000) {
    errors.push('text must not exceed 8000 characters');
  }

  return { valid: errors.length === 0, errors };
}
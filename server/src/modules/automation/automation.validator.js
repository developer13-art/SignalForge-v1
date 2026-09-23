/**
 * Automation Validators
 *
 * @module signalforge/server/modules/automation/validator
 */

import {
  AUTOMATION_CONDITION_VALUES,
  AUTOMATION_ACTION_VALUES,
  AUTOMATION_RULE_SCOPE_VALUES,
  MIN_RULE_PRIORITY,
  MAX_RULE_PRIORITY,
} from './automation.constants.js';

export function validateRuleCreatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.push('name is required');
  } else if (body.name.length > 128) {
    errors.push('name must not exceed 128 characters');
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.length > 512) {
      errors.push('description must not exceed 512 characters');
    }
  }

  if (body.scope !== undefined && !AUTOMATION_RULE_SCOPE_VALUES.includes(body.scope)) {
    errors.push(`scope must be one of: ${AUTOMATION_RULE_SCOPE_VALUES.join(', ')}`);
  }

  if (!body.condition || typeof body.condition !== 'object') {
    errors.push('condition is required');
  } else if (!AUTOMATION_CONDITION_VALUES.includes(body.condition.type)) {
    errors.push(`condition.type must be one of: ${AUTOMATION_CONDITION_VALUES.join(', ')}`);
  }

  if (!body.action || typeof body.action !== 'object') {
    errors.push('action is required');
  } else if (!AUTOMATION_ACTION_VALUES.includes(body.action.type)) {
    errors.push(`action.type must be one of: ${AUTOMATION_ACTION_VALUES.join(', ')}`);
  }

  if (body.priority !== undefined) {
    if (
      typeof body.priority !== 'number' ||
      body.priority < MIN_RULE_PRIORITY ||
      body.priority > MAX_RULE_PRIORITY
    ) {
      errors.push(`priority must be between ${MIN_RULE_PRIORITY} and ${MAX_RULE_PRIORITY}`);
    }
  }

  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  if (body.stopOnMatch !== undefined && typeof body.stopOnMatch !== 'boolean') {
    errors.push('stopOnMatch must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateRuleUpdatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.length > 128) {
      errors.push('name must not exceed 128 characters');
    }
  }

  if (body.scope !== undefined && !AUTOMATION_RULE_SCOPE_VALUES.includes(body.scope)) {
    errors.push(`scope must be one of: ${AUTOMATION_RULE_SCOPE_VALUES.join(', ')}`);
  }

  if (body.condition !== undefined) {
    if (!body.condition || typeof body.condition !== 'object') {
      errors.push('condition must be an object');
    } else if (!AUTOMATION_CONDITION_VALUES.includes(body.condition.type)) {
      errors.push(`condition.type must be one of: ${AUTOMATION_CONDITION_VALUES.join(', ')}`);
    }
  }

  if (body.action !== undefined) {
    if (!body.action || typeof body.action !== 'object') {
      errors.push('action must be an object');
    } else if (!AUTOMATION_ACTION_VALUES.includes(body.action.type)) {
      errors.push(`action.type must be one of: ${AUTOMATION_ACTION_VALUES.join(', ')}`);
    }
  }

  if (body.priority !== undefined) {
    if (
      typeof body.priority !== 'number' ||
      body.priority < MIN_RULE_PRIORITY ||
      body.priority > MAX_RULE_PRIORITY
    ) {
      errors.push(`priority must be between ${MIN_RULE_PRIORITY} and ${MAX_RULE_PRIORITY}`);
    }
  }

  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateEvaluatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.context || typeof body.context !== 'object') {
    errors.push('context is required');
  }

  return { valid: errors.length === 0, errors };
}
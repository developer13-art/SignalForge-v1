/**
 * DNA Validators
 *
 * @module signalforge/server/modules/provider-dna/validator
 */

import {
  DNA_RULE_TYPE_VALUES,
  DNA_MATCH_TYPE_VALUES,
} from './dna.constants.js';

export function validateCreateDnaPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.providerId || typeof body.providerId !== 'string') {
    errors.push('providerId is required');
  }

  if (body.language !== undefined && typeof body.language !== 'string') {
    errors.push('language must be a string');
  }

  return { valid: errors.length === 0, errors };
}

export function validateRuleCreatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!body.ruleType || !DNA_RULE_TYPE_VALUES.includes(body.ruleType)) {
    errors.push(`ruleType must be one of: ${DNA_RULE_TYPE_VALUES.join(', ')}`);
  }

  if (!body.pattern || typeof body.pattern !== 'string') {
    errors.push('pattern is required');
  }

  if (!body.action || typeof body.action !== 'object') {
    errors.push('action is required');
  }

  if (body.matchType !== undefined && !DNA_MATCH_TYPE_VALUES.includes(body.matchType)) {
    errors.push(`matchType must be one of: ${DNA_MATCH_TYPE_VALUES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateLearningPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    errors.push('messages must be a non-empty array');
  }

  if (!Array.isArray(body.parsedSignals)) {
    errors.push('parsedSignals must be an array');
  }

  if (Array.isArray(body.messages) && Array.isArray(body.parsedSignals)) {
    if (body.messages.length !== body.parsedSignals.length) {
      errors.push('messages and parsedSignals must have the same length');
    }
  }

  return { valid: errors.length === 0, errors };
}
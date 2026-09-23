/**
 * Automation Module Errors
 *
 * @module signalforge/server/modules/automation/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';

export class AutomationRuleNotFoundError extends NotFoundError {
  constructor(message = 'Automation rule not found', details = {}) {
    super(message, { code: 'AUTOMATION_RULE_NOT_FOUND', details });
    this.name = 'AutomationRuleNotFoundError';
  }
}

export class AutomationRuleInvalidError extends ValidationError {
  constructor(message = 'Automation rule is invalid', details = {}) {
    super(message, { code: 'AUTOMATION_RULE_INVALID', details });
    this.name = 'AutomationRuleInvalidError';
  }
}

export class AutomationRuleLimitExceededError extends ConflictError {
  constructor(message = 'Automation rule limit exceeded') {
    super(message, { code: 'AUTOMATION_RULE_LIMIT_EXCEEDED' });
    this.name = 'AutomationRuleLimitExceededError';
  }
}

export class AutomationEvaluationFailedError extends Error {
  constructor(message = 'Automation evaluation failed', details = {}) {
    super(message);
    this.name = 'AutomationEvaluationFailedError';
    this.code = 'AUTOMATION_EVALUATION_FAILED';
    this.details = details;
  }
}

export class AutomationActionFailedError extends Error {
  constructor(message = 'Automation action failed', details = {}) {
    super(message);
    this.name = 'AutomationActionFailedError';
    this.code = 'AUTOMATION_ACTION_FAILED';
    this.details = details;
  }
}

export class UnsupportedConditionError extends ValidationError {
  constructor(message = 'Unsupported condition type', details = {}) {
    super(message, { code: 'UNSUPPORTED_CONDITION', details });
    this.name = 'UnsupportedConditionError';
  }
}

export class UnsupportedActionError extends ValidationError {
  constructor(message = 'Unsupported action type', details = {}) {
    super(message, { code: 'UNSUPPORTED_ACTION', details });
    this.name = 'UnsupportedActionError';
  }
}
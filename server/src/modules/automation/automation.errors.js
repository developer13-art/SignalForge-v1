/**
 * Automation Module Errors
 *
 * @module signalforge/server/modules/automation/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class AutomationRuleNotFoundError extends NotFoundError {
  constructor(message = 'Automation rule not found', details = {}) {
    super(message, { code: 'AUTOMATION_RULE_NOT_FOUND', details });
    this.name = 'AutomationRuleNotFoundError';
  }
}
class AutomationRuleInvalidError extends ValidationError {
  constructor(message = 'Automation rule is invalid', details = {}) {
    super(message, { code: 'AUTOMATION_RULE_INVALID', details });
    this.name = 'AutomationRuleInvalidError';
  }
}
class AutomationRuleLimitExceededError extends ConflictError {
  constructor(message = 'Automation rule limit exceeded') {
    super(message, { code: 'AUTOMATION_RULE_LIMIT_EXCEEDED' });
    this.name = 'AutomationRuleLimitExceededError';
  }
}
class AutomationEvaluationFailedError extends Error {
  constructor(message = 'Automation evaluation failed', details = {}) {
    super(message);
    this.name = 'AutomationEvaluationFailedError';
    this.code = 'AUTOMATION_EVALUATION_FAILED';
    this.details = details;
  }
}
class AutomationActionFailedError extends Error {
  constructor(message = 'Automation action failed', details = {}) {
    super(message);
    this.name = 'AutomationActionFailedError';
    this.code = 'AUTOMATION_ACTION_FAILED';
    this.details = details;
  }
}
class UnsupportedConditionError extends ValidationError {
  constructor(message = 'Unsupported condition type', details = {}) {
    super(message, { code: 'UNSUPPORTED_CONDITION', details });
    this.name = 'UnsupportedConditionError';
  }
}
class UnsupportedActionError extends ValidationError {
  constructor(message = 'Unsupported action type', details = {}) {
    super(message, { code: 'UNSUPPORTED_ACTION', details });
    this.name = 'UnsupportedActionError';
  }
}
module.exports.AutomationRuleNotFoundError = AutomationRuleNotFoundError;
module.exports.AutomationRuleInvalidError = AutomationRuleInvalidError;
module.exports.AutomationRuleLimitExceededError = AutomationRuleLimitExceededError;
module.exports.AutomationEvaluationFailedError = AutomationEvaluationFailedError;
module.exports.AutomationActionFailedError = AutomationActionFailedError;
module.exports.UnsupportedConditionError = UnsupportedConditionError;
module.exports.UnsupportedActionError = UnsupportedActionError;

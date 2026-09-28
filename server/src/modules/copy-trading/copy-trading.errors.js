/**
 * Copy Trading Module Errors
 *
 * @module signalforge/server/modules/copy-trading/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
const { AuthorizationError } = require('../../lib/errors/authorization-error.js');
class SubscriptionNotFoundError extends NotFoundError {
  constructor(message = 'Provider subscription not found', details = {}) {
    super(message, { code: 'SUBSCRIPTION_NOT_FOUND', details });
    this.name = 'SubscriptionNotFoundError';
  }
}
class SubscriptionAlreadyExistsError extends ConflictError {
  constructor(message = 'Already subscribed to this provider') {
    super(message, { code: 'SUBSCRIPTION_ALREADY_EXISTS' });
    this.name = 'SubscriptionAlreadyExistsError';
  }
}
class SubscriptionInactiveError extends AuthorizationError {
  constructor(message = 'Subscription is not active', details = {}) {
    super(message, { code: 'SUBSCRIPTION_INACTIVE', details });
    this.name = 'SubscriptionInactiveError';
  }
}
class FanOutError extends Error {
  constructor(message = 'Fan-out failed', details = {}) {
    super(message);
    this.name = 'FanOutError';
    this.code = 'FAN_OUT_ERROR';
    this.details = details;
  }
}
class PersonalizationError extends Error {
  constructor(message = 'Personalization failed', details = {}) {
    super(message);
    this.name = 'PersonalizationError';
    this.code = 'PERSONALIZATION_ERROR';
    this.details = details;
  }
}
class ScalingCalculationError extends ValidationError {
  constructor(message = 'Scaling calculation failed', details = {}) {
    super(message, { code: 'SCALING_CALCULATION_FAILED', details });
    this.name = 'ScalingCalculationError';
  }
}
class SubscriberLimitExceededError extends ConflictError {
  constructor(message = 'Provider subscriber limit exceeded') {
    super(message, { code: 'SUBSCRIBER_LIMIT_EXCEEDED' });
    this.name = 'SubscriberLimitExceededError';
  }
}
class InvalidScalingModeError extends ValidationError {
  constructor(message = 'Invalid scaling mode', details = {}) {
    super(message, { code: 'INVALID_SCALING_MODE', details });
    this.name = 'InvalidScalingModeError';
  }
}   
module.exports.SubscriptionNotFoundError = SubscriptionNotFoundError;
module.exports.SubscriptionAlreadyExistsError = SubscriptionAlreadyExistsError;
module.exports.SubscriptionInactiveError = SubscriptionInactiveError;
module.exports.FanOutError = FanOutError;
module.exports.PersonalizationError = PersonalizationError;
module.exports.ScalingCalculationError = ScalingCalculationError;
module.exports.SubscriberLimitExceededError = SubscriberLimitExceededError;
module.exports.InvalidScalingModeError = InvalidScalingModeError;

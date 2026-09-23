/**
 * Copy Trading Module Errors
 *
 * @module signalforge/server/modules/copy-trading/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class SubscriptionNotFoundError extends NotFoundError {
  constructor(message = 'Provider subscription not found', details = {}) {
    super(message, { code: 'SUBSCRIPTION_NOT_FOUND', details });
    this.name = 'SubscriptionNotFoundError';
  }
}

export class SubscriptionAlreadyExistsError extends ConflictError {
  constructor(message = 'Already subscribed to this provider') {
    super(message, { code: 'SUBSCRIPTION_ALREADY_EXISTS' });
    this.name = 'SubscriptionAlreadyExistsError';
  }
}

export class SubscriptionInactiveError extends AuthorizationError {
  constructor(message = 'Subscription is not active', details = {}) {
    super(message, { code: 'SUBSCRIPTION_INACTIVE', details });
    this.name = 'SubscriptionInactiveError';
  }
}

export class FanOutError extends Error {
  constructor(message = 'Fan-out failed', details = {}) {
    super(message);
    this.name = 'FanOutError';
    this.code = 'FAN_OUT_ERROR';
    this.details = details;
  }
}

export class PersonalizationError extends Error {
  constructor(message = 'Personalization failed', details = {}) {
    super(message);
    this.name = 'PersonalizationError';
    this.code = 'PERSONALIZATION_ERROR';
    this.details = details;
  }
}

export class ScalingCalculationError extends ValidationError {
  constructor(message = 'Scaling calculation failed', details = {}) {
    super(message, { code: 'SCALING_CALCULATION_FAILED', details });
    this.name = 'ScalingCalculationError';
  }
}

export class SubscriberLimitExceededError extends ConflictError {
  constructor(message = 'Provider subscriber limit exceeded') {
    super(message, { code: 'SUBSCRIBER_LIMIT_EXCEEDED' });
    this.name = 'SubscriberLimitExceededError';
  }
}

export class InvalidScalingModeError extends ValidationError {
  constructor(message = 'Invalid scaling mode', details = {}) {
    super(message, { code: 'INVALID_SCALING_MODE', details });
    this.name = 'InvalidScalingModeError';
  }
}   
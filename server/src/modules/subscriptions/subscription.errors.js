/**
 * Subscriptions Module Errors
 *
 * @module signalforge/server/modules/subscriptions/errors
 */

import { NotFoundError } from '../../lib/errors/not-found-error.js';
import { ValidationError } from '../../lib/errors/validation-error.js';
import { ConflictError } from '../../lib/errors/conflict-error.js';
import { AuthorizationError } from '../../lib/errors/authorization-error.js';

export class PlanNotFoundError extends NotFoundError {
  constructor(message = 'Subscription plan not found', details = {}) {
    super(message, { code: 'PLAN_NOT_FOUND', details });
    this.name = 'PlanNotFoundError';
  }
}

export class SubscriptionNotFoundError extends NotFoundError {
  constructor(message = 'Subscription not found', details = {}) {
    super(message, { code: 'SUBSCRIPTION_NOT_FOUND', details });
    this.name = 'SubscriptionNotFoundError';
  }
}

export class SubscriptionAlreadyExistsError extends ConflictError {
  constructor(message = 'An active subscription already exists for this user') {
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

export class SubscriptionExpiredError extends AuthorizationError {
  constructor(message = 'Subscription has expired', details = {}) {
    super(message, { code: 'SUBSCRIPTION_EXPIRED', details });
    this.name = 'SubscriptionExpiredError';
  }
}

export class SubscriptionNotCancellableError extends ConflictError {
  constructor(message = 'Subscription cannot be cancelled in its current state', details = {}) {
    super(message, { code: 'SUBSCRIPTION_NOT_CANCELLABLE', details });
    this.name = 'SubscriptionNotCancellableError';
  }
}

export class SubscriptionNotResumableError extends ConflictError {
  constructor(message = 'Subscription cannot be resumed in its current state', details = {}) {
    super(message, { code: 'SUBSCRIPTION_NOT_RESUMABLE', details });
    this.name = 'SubscriptionNotResumableError';
  }
}

export class UsageLimitExceededError extends AuthorizationError {
  constructor(message = 'Usage limit exceeded for this plan', details = {}) {
    super(message, { code: 'USAGE_LIMIT_EXCEEDED', details });
    this.name = 'UsageLimitExceededError';
  }
}

export class InvalidPlanPayloadError extends ValidationError {
  constructor(message = 'Plan payload is invalid', details = {}) {
    super(message, { code: 'INVALID_PLAN_PAYLOAD', details });
    this.name = 'InvalidPlanPayloadError';
  }
}

export class PlanAlreadyExistsError extends ConflictError {
  constructor(message = 'A plan with this code already exists') {
    super(message, { code: 'PLAN_ALREADY_EXISTS' });
    this.name = 'PlanAlreadyExistsError';
  }
}

export class PlanNotEditableError extends ConflictError {
  constructor(message = 'Plan cannot be edited while active subscriptions exist', details = {}) {
    super(message, { code: 'PLAN_NOT_EDITABLE', details });
    this.name = 'PlanNotEditableError';
  }
}

export class UpgradeFailedError extends Error {
  constructor(message = 'Subscription upgrade failed', details = {}) {
    super(message);
    this.name = 'UpgradeFailedError';
    this.code = 'UPGRADE_FAILED';
    this.details = details;
  }
}

export class DowngradeFailedError extends Error {
  constructor(message = 'Subscription downgrade failed', details = {}) {
    super(message);
    this.name = 'DowngradeFailedError';
    this.code = 'DOWNGRADE_FAILED';
    this.details = details;
  }
}
/**
 * Subscription Required Error
 *
 * @module server/lib/errors/subscription-required-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');

export class SubscriptionRequiredError extends AppError {
  constructor(message = 'Active subscription required', details = null) {
    super(message, ERROR_CODES.SUBSCRIPTION_REQUIRED, 403, details);
    this.name = 'SubscriptionRequiredError';
  }
}
module.exports = SubscriptionRequiredError;
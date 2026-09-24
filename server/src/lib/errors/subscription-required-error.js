/**
 * Subscription Required Error
 *
 * @module server/lib/errors/subscription-required-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class SubscriptionRequiredError extends AppError {
  constructor(message = 'Active subscription required', details = null) {
    super(message, ERROR_CODES.SUBSCRIPTION_REQUIRED, 403, details);
    this.name = 'SubscriptionRequiredError';
  }
}

export default SubscriptionRequiredError;
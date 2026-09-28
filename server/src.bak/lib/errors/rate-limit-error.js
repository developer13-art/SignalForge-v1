/**
 * Rate Limit Error
 *
 * @module server/lib/errors/rate-limit-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', details = null) {
    super(message, ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitError';
  }
}

export default RateLimitError;
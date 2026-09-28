/**
 * Rate Limit Error
 *
 * @module server/lib/errors/rate-limit-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');
class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', details = null) {
    super(message, ERROR_CODES.RATE_LIMITED, 429, details);
    this.name = 'RateLimitError';
  }
}
module.exports = RateLimitError;
module.exports.RateLimitError = RateLimitError;

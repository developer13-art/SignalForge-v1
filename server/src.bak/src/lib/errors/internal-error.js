/**
 * Internal Error
 *
 * @module server/lib/errors/internal-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');

export class InternalError extends AppError {
  constructor(message = 'Internal server error', details = null) {
    super(message, ERROR_CODES.INTERNAL_ERROR, 500, details);
    this.name = 'InternalError';
  }
}
module.exports = InternalError;
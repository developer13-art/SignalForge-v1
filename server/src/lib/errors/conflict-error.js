/**
 * Conflict Error
 *
 * @module server/lib/errors/conflict-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');
class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, ERROR_CODES.CONFLICT, 409, details);
    this.name = 'ConflictError';
  }
}
module.exports = ConflictError;
module.exports.ConflictError = ConflictError;

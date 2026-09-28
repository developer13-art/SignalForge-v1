/**
 * Validation Error
 *
 * @module server/lib/errors/validation-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, ERROR_CODES.VALIDATION_FAILED, 400, details);
    this.name = 'ValidationError';
  }
}
module.exports = ValidationError;
module.exports.ValidationError = ValidationError;

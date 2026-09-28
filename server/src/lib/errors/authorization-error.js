/**
 * Authorization Error
 *
 * @module server/lib/errors/authorization-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');
class AuthorizationError extends AppError {
  constructor(message, details = null) {
    super(message, ERROR_CODES.AUTHORIZATION_FAILED, 403, details);
    this.name = 'AuthorizationError';
  }
}
module.exports = AuthorizationError;
module.exports.AuthorizationError = AuthorizationError;

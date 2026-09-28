/**
 * Authentication Error
 *
 * @module server/lib/errors/authentication-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');

export class AuthenticationError extends AppError {
  constructor(message, code = ERROR_CODES.AUTHENTICATION_REQUIRED, details = null) {
    super(message, code, 401, details);
    this.name = 'AuthenticationError';
  }
}
module.exports = AuthenticationError; 
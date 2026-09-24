/**
 * Authentication Error
 *
 * @module server/lib/errors/authentication-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class AuthenticationError extends AppError {
  constructor(message, code = ERROR_CODES.AUTHENTICATION_REQUIRED, details = null) {
    super(message, code, 401, details);
    this.name = 'AuthenticationError';
  }
}

export default AuthenticationError; 
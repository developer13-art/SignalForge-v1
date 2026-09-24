/**
 * Authorization Error
 *
 * @module server/lib/errors/authorization-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class AuthorizationError extends AppError {
  constructor(message, details = null) {
    super(message, ERROR_CODES.AUTHORIZATION_FAILED, 403, details);
    this.name = 'AuthorizationError';
  }
}

export default AuthorizationError;
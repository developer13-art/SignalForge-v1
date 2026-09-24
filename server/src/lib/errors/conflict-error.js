/**
 * Conflict Error
 *
 * @module server/lib/errors/conflict-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, ERROR_CODES.CONFLICT, 409, details);
    this.name = 'ConflictError';
  }
}

export default ConflictError;
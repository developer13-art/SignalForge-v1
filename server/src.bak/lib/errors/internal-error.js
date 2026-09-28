/**
 * Internal Error
 *
 * @module server/lib/errors/internal-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class InternalError extends AppError {
  constructor(message = 'Internal server error', details = null) {
    super(message, ERROR_CODES.INTERNAL_ERROR, 500, details);
    this.name = 'InternalError';
  }
}

export default InternalError;
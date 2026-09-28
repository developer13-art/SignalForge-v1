/**
 * Validation Error
 *
 * @module server/lib/errors/validation-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, ERROR_CODES.VALIDATION_FAILED, 400, details);
    this.name = 'ValidationError';
  }
}

export default ValidationError;
/**
 * Not Found Error
 *
 * @module server/lib/errors/not-found-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, ERROR_CODES.NOT_FOUND, 404, details);
    this.name = 'NotFoundError';
  }
}

export default NotFoundError;
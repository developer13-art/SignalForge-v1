/**
 * Not Found Error
 *
 * @module server/lib/errors/not-found-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, ERROR_CODES.NOT_FOUND, 404, details);
    this.name = 'NotFoundError';
  }
}
module.exports = NotFoundError;
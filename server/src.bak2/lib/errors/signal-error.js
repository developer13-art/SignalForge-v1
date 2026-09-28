/**
 * Signal Error
 *
 * @module server/lib/errors/signal-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');

export class SignalError extends AppError {
  constructor(message, code = ERROR_CODES.SIGNAL_INVALID, statusCode = 400, details = null) {
    super(message, code, statusCode, details);
    this.name = 'SignalError';
  }
}
module.exports = SignalError;
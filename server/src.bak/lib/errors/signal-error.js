/**
 * Signal Error
 *
 * @module server/lib/errors/signal-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class SignalError extends AppError {
  constructor(message, code = ERROR_CODES.SIGNAL_INVALID, statusCode = 400, details = null) {
    super(message, code, statusCode, details);
    this.name = 'SignalError';
  }
}

export default SignalError;
/**
 * Broker Error
 *
 * @module server/lib/errors/broker-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class BrokerError extends AppError {
  constructor(message, code = ERROR_CODES.BROKER_CONNECTION_FAILED, details = null) {
    super(message, code, 502, details);
    this.name = 'BrokerError';
  }
}

export default BrokerError;
/**
 * Trade Error
 *
 * @module server/lib/errors/trade-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class TradeError extends AppError {
  constructor(message, code = ERROR_CODES.TRADE_EXECUTION_FAILED, statusCode = 400, details = null) {
    super(message, code, statusCode, details);
    this.name = 'TradeError';
  }
}

export default TradeError;
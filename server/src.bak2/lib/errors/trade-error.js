/**
 * Trade Error
 *
 * @module server/lib/errors/trade-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');

export class TradeError extends AppError {
  constructor(message, code = ERROR_CODES.TRADE_EXECUTION_FAILED, statusCode = 400, details = null) {
    super(message, code, statusCode, details);
    this.name = 'TradeError';
  }
}
module.exports = TradeError;
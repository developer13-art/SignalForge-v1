/**
 * Broker Error
 *
 * @module server/lib/errors/broker-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');
class BrokerError extends AppError {
  constructor(message, code = ERROR_CODES.BROKER_CONNECTION_FAILED, details = null) {
    super(message, code, 502, details);
    this.name = 'BrokerError';
  }
}
module.exports = BrokerError;
module.exports.BrokerError = BrokerError;

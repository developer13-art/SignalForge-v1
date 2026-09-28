/**
 * KYC Required Error
 *
 * @module server/lib/errors/kyc-required-error
 */
const { AppError } = require('./app-error');
const { ERROR_CODES } = require('./error-codes');

export class KycRequiredError extends AppError {
  constructor(message = 'KYC verification required', details = null) {
    super(message, ERROR_CODES.KYC_REQUIRED, 403, details);
    this.name = 'KycRequiredError';
  }
}
module.exports = KycRequiredError;
/**
 * KYC Required Error
 *
 * @module server/lib/errors/kyc-required-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class KycRequiredError extends AppError {
  constructor(message = 'KYC verification required', details = null) {
    super(message, ERROR_CODES.KYC_REQUIRED, 403, details);
    this.name = 'KycRequiredError';
  }
}

export default KycRequiredError;
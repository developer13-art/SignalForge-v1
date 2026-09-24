/**
 * Payment Error
 *
 * @module server/lib/errors/payment-error
 */

import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

export class PaymentError extends AppError {
  constructor(message, code = ERROR_CODES.PAYMENT_FAILED, statusCode = 400, details = null) {
    super(message, code, statusCode, details);
    this.name = 'PaymentError';
  }
}

export default PaymentError;
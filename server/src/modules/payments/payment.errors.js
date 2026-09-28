/**
 * Payments Module Errors
 *
 * @module signalforge/server/modules/payments/errors
 */
const { NotFoundError } = require('../../lib/errors/not-found-error.js');
const { ValidationError } = require('../../lib/errors/validation-error.js');
const { ConflictError } = require('../../lib/errors/conflict-error.js');
class PaymentNotFoundError extends NotFoundError {
  constructor(message = 'Payment not found', details = {}) {
    super(message, { code: 'PAYMENT_NOT_FOUND', details });
    this.name = 'PaymentNotFoundError';
  }
}
class PaymentIntentNotFoundError extends NotFoundError {
  constructor(message = 'Payment intent not found', details = {}) {
    super(message, { code: 'PAYMENT_INTENT_NOT_FOUND', details });
    this.name = 'PaymentIntentNotFoundError';
  }
}
class InvoiceNotFoundError extends NotFoundError {
  constructor(message = 'Invoice not found', details = {}) {
    super(message, { code: 'INVOICE_NOT_FOUND', details });
    this.name = 'InvoiceNotFoundError';
  }
}
class RefundNotFoundError extends NotFoundError {
  constructor(message = 'Refund not found', details = {}) {
    super(message, { code: 'REFUND_NOT_FOUND', details });
    this.name = 'RefundNotFoundError';
  }
}
class InvalidPaymentPayloadError extends ValidationError {
  constructor(message = 'Payment payload is invalid', details = {}) {
    super(message, { code: 'INVALID_PAYMENT_PAYLOAD', details });
    this.name = 'InvalidPaymentPayloadError';
  }
}
class PaymentAlreadyFinalizedError extends ConflictError {
  constructor(message = 'Payment has already reached a final state', details = {}) {
    super(message, { code: 'PAYMENT_ALREADY_FINALIZED', details });
    this.name = 'PaymentAlreadyFinalizedError';
  }
}
class PaymentProviderError extends Error {
  constructor(message = 'Payment provider error', details = {}) {
    super(message);
    this.name = 'PaymentProviderError';
    this.code = 'PAYMENT_PROVIDER_ERROR';
    this.details = details;
  }
}
class PaymentProviderNotConfiguredError extends Error {
  constructor(message = 'Payment provider is not configured', details = {}) {
    super(message);
    this.name = 'PaymentProviderNotConfiguredError';
    this.code = 'PAYMENT_PROVIDER_NOT_CONFIGURED';
    this.details = details;
  }
}
class UnsupportedPaymentProviderError extends ValidationError {
  constructor(message = 'Unsupported payment provider', details = {}) {
    super(message, { code: 'UNSUPPORTED_PAYMENT_PROVIDER', details });
    this.name = 'UnsupportedPaymentProviderError';
  }
}
class WebhookVerificationError extends ValidationError {
  constructor(message = 'Webhook verification failed', details = {}) {
    super(message, { code: 'WEBHOOK_VERIFICATION_FAILED', details });
    this.name = 'WebhookVerificationError';
  }
}
class RefundFailedError extends Error {
  constructor(message = 'Refund failed', details = {}) {
    super(message);
    this.name = 'RefundFailedError';
    this.code = 'REFUND_FAILED';
    this.details = details;
  }
}
class RefundWindowExpiredError extends ConflictError {
  constructor(message = 'Refund window has expired', details = {}) {
    super(message, { code: 'REFUND_WINDOW_EXPIRED', details });
    this.name = 'RefundWindowExpiredError';
  }
}
class InsufficientRefundableAmountError extends ConflictError {
  constructor(message = 'Refund amount exceeds remaining refundable balance', details = {}) {
    super(message, { code: 'INSUFFICIENT_REFUNDABLE_AMOUNT', details });
    this.name = 'InsufficientRefundableAmountError';
  }
}
module.exports.PaymentNotFoundError = PaymentNotFoundError;
module.exports.PaymentIntentNotFoundError = PaymentIntentNotFoundError;
module.exports.InvoiceNotFoundError = InvoiceNotFoundError;
module.exports.RefundNotFoundError = RefundNotFoundError;
module.exports.InvalidPaymentPayloadError = InvalidPaymentPayloadError;
module.exports.PaymentAlreadyFinalizedError = PaymentAlreadyFinalizedError;
module.exports.PaymentProviderError = PaymentProviderError;
module.exports.PaymentProviderNotConfiguredError = PaymentProviderNotConfiguredError;
module.exports.UnsupportedPaymentProviderError = UnsupportedPaymentProviderError;
module.exports.WebhookVerificationError = WebhookVerificationError;
module.exports.RefundFailedError = RefundFailedError;
module.exports.RefundWindowExpiredError = RefundWindowExpiredError;
module.exports.InsufficientRefundableAmountError = InsufficientRefundableAmountError;

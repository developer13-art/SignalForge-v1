/**
 * Payments Module Constants
 *
 * @module signalforge/server/modules/payments/constants
 */
const PAYMENT_EVENTS = Object.freeze({
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_PENDING: 'payment.pending',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_CANCELLED: 'payment.cancelled',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_PARTIALLY_REFUNDED: 'payment.partially_refunded',
  PAYMENT_DISPUTED: 'payment.disputed',
  PAYMENT_REQUIRES_ACTION: 'payment.requires_action',
  WEBHOOK_RECEIVED: 'payment.webhook.received',
  WEBHOOK_VERIFIED: 'payment.webhook.verified',
  WEBHOOK_FAILED: 'payment.webhook.failed',
  INVOICE_CREATED: 'payment.invoice.created',
  INVOICE_PAID: 'payment.invoice.paid',
  INVOICE_VOIDED: 'payment.invoice.voided',
  REFUND_INITIATED: 'payment.refund.initiated',
  REFUND_COMPLETED: 'payment.refund.completed',
  REFUND_FAILED: 'payment.refund.failed',
});
const PAYMENT_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  REQUIRES_ACTION: 'REQUIRES_ACTION',
  CONFIRMED: 'CONFIRMED',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  DISPUTED: 'DISPUTED',
});
const PAYMENT_STATUS_VALUES = Object.freeze(Object.values(PAYMENT_STATUSES));
const PAYMENT_PROVIDERS = Object.freeze({
  STRIPE: 'STRIPE',
  PAYSTACK: 'PAYSTACK',
  FLUTTERWAVE: 'FLUTTERWAVE',
  SOLANA: 'SOLANA',
  INTERNAL_WALLET: 'INTERNAL_WALLET',
});
const PAYMENT_PROVIDER_VALUES = Object.freeze(Object.values(PAYMENT_PROVIDERS));
const PAYMENT_PURPOSES = Object.freeze({
  SUBSCRIPTION: 'SUBSCRIPTION',
  WALLET_TOPUP: 'WALLET_TOPUP',
  PROVIDER_SUBSCRIPTION: 'PROVIDER_SUBSCRIPTION',
  MARKETPLACE_PURCHASE: 'MARKETPLACE_PURCHASE',
  OTHER: 'OTHER',
});
const PAYMENT_PURPOSE_VALUES = Object.freeze(Object.values(PAYMENT_PURPOSES));
const REFUND_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
});
const REFUND_STATUS_VALUES = Object.freeze(Object.values(REFUND_STATUSES));
const INVOICE_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  PAID: 'PAID',
  VOID: 'VOID',
  UNCOLLECTIBLE: 'UNCOLLECTIBLE',
});
const INVOICE_STATUS_VALUES = Object.freeze(Object.values(INVOICE_STATUSES));
const FINAL_PAYMENT_STATUSES = Object.freeze([
  PAYMENT_STATUSES.SUCCEEDED,
  PAYMENT_STATUSES.FAILED,
  PAYMENT_STATUSES.CANCELLED,
  PAYMENT_STATUSES.REFUNDED,
  PAYMENT_STATUSES.PARTIALLY_REFUNDED,
]);
const SUCCESSFUL_PAYMENT_STATUSES = Object.freeze([
  PAYMENT_STATUSES.SUCCEEDED,
  PAYMENT_STATUSES.CONFIRMED,
]);
const DEFAULT_INVOICE_PREFIX = 'SF-INV';
const DEFAULT_INVOICE_DUE_DAYS = 7;
const DEFAULT_PLATFORM_FEE_PERCENT = 3;
const DEFAULT_REFUND_WINDOW_DAYS = 14;
const DEFAULT_MAX_AMOUNT_USD = 10000;
const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 300;
function isValidPaymentStatus(status) {
  return PAYMENT_STATUS_VALUES.includes(status);
}
function isValidPaymentProvider(provider) {
  return PAYMENT_PROVIDER_VALUES.includes(provider);
}
function isValidPaymentPurpose(purpose) {
  return PAYMENT_PURPOSE_VALUES.includes(purpose);
}
function isValidRefundStatus(status) {
  return REFUND_STATUS_VALUES.includes(status);
}
function isValidInvoiceStatus(status) {
  return INVOICE_STATUS_VALUES.includes(status);
}
function isFinalPaymentStatus(status) {
  return FINAL_PAYMENT_STATUSES.includes(status);
}
function isSuccessfulPayment(status) {
  return SUCCESSFUL_PAYMENT_STATUSES.includes(status);
}
module.exports.PAYMENT_EVENTS = PAYMENT_EVENTS;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
module.exports.PAYMENT_STATUS_VALUES = PAYMENT_STATUS_VALUES;
module.exports.PAYMENT_PROVIDERS = PAYMENT_PROVIDERS;
module.exports.PAYMENT_PROVIDER_VALUES = PAYMENT_PROVIDER_VALUES;
module.exports.PAYMENT_PURPOSES = PAYMENT_PURPOSES;
module.exports.PAYMENT_PURPOSE_VALUES = PAYMENT_PURPOSE_VALUES;
module.exports.REFUND_STATUSES = REFUND_STATUSES;
module.exports.REFUND_STATUS_VALUES = REFUND_STATUS_VALUES;
module.exports.INVOICE_STATUSES = INVOICE_STATUSES;
module.exports.INVOICE_STATUS_VALUES = INVOICE_STATUS_VALUES;
module.exports.FINAL_PAYMENT_STATUSES = FINAL_PAYMENT_STATUSES;
module.exports.SUCCESSFUL_PAYMENT_STATUSES = SUCCESSFUL_PAYMENT_STATUSES;
module.exports.DEFAULT_INVOICE_PREFIX = DEFAULT_INVOICE_PREFIX;
module.exports.DEFAULT_INVOICE_DUE_DAYS = DEFAULT_INVOICE_DUE_DAYS;
module.exports.DEFAULT_PLATFORM_FEE_PERCENT = DEFAULT_PLATFORM_FEE_PERCENT;
module.exports.DEFAULT_REFUND_WINDOW_DAYS = DEFAULT_REFUND_WINDOW_DAYS;
module.exports.DEFAULT_MAX_AMOUNT_USD = DEFAULT_MAX_AMOUNT_USD;
module.exports.DEFAULT_WEBHOOK_TOLERANCE_SECONDS = DEFAULT_WEBHOOK_TOLERANCE_SECONDS;
module.exports.isValidPaymentStatus = isValidPaymentStatus;
module.exports.isValidPaymentProvider = isValidPaymentProvider;
module.exports.isValidPaymentPurpose = isValidPaymentPurpose;
module.exports.isValidRefundStatus = isValidRefundStatus;
module.exports.isValidInvoiceStatus = isValidInvoiceStatus;
module.exports.isFinalPaymentStatus = isFinalPaymentStatus;
module.exports.isSuccessfulPayment = isSuccessfulPayment;

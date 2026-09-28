/**
 * Payments Module Constants
 *
 * @module signalforge/server/modules/payments/constants
 */

export const PAYMENT_EVENTS = Object.freeze({
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

export const PAYMENT_STATUSES = Object.freeze({
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

export const PAYMENT_STATUS_VALUES = Object.freeze(Object.values(PAYMENT_STATUSES));

export const PAYMENT_PROVIDERS = Object.freeze({
  STRIPE: 'STRIPE',
  PAYSTACK: 'PAYSTACK',
  FLUTTERWAVE: 'FLUTTERWAVE',
  SOLANA: 'SOLANA',
  INTERNAL_WALLET: 'INTERNAL_WALLET',
});

export const PAYMENT_PROVIDER_VALUES = Object.freeze(Object.values(PAYMENT_PROVIDERS));

export const PAYMENT_PURPOSES = Object.freeze({
  SUBSCRIPTION: 'SUBSCRIPTION',
  WALLET_TOPUP: 'WALLET_TOPUP',
  PROVIDER_SUBSCRIPTION: 'PROVIDER_SUBSCRIPTION',
  MARKETPLACE_PURCHASE: 'MARKETPLACE_PURCHASE',
  OTHER: 'OTHER',
});

export const PAYMENT_PURPOSE_VALUES = Object.freeze(Object.values(PAYMENT_PURPOSES));

export const REFUND_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
});

export const REFUND_STATUS_VALUES = Object.freeze(Object.values(REFUND_STATUSES));

export const INVOICE_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  PAID: 'PAID',
  VOID: 'VOID',
  UNCOLLECTIBLE: 'UNCOLLECTIBLE',
});

export const INVOICE_STATUS_VALUES = Object.freeze(Object.values(INVOICE_STATUSES));

export const FINAL_PAYMENT_STATUSES = Object.freeze([
  PAYMENT_STATUSES.SUCCEEDED,
  PAYMENT_STATUSES.FAILED,
  PAYMENT_STATUSES.CANCELLED,
  PAYMENT_STATUSES.REFUNDED,
  PAYMENT_STATUSES.PARTIALLY_REFUNDED,
]);

export const SUCCESSFUL_PAYMENT_STATUSES = Object.freeze([
  PAYMENT_STATUSES.SUCCEEDED,
  PAYMENT_STATUSES.CONFIRMED,
]);

export const DEFAULT_INVOICE_PREFIX = 'SF-INV';
export const DEFAULT_INVOICE_DUE_DAYS = 7;
export const DEFAULT_PLATFORM_FEE_PERCENT = 3;
export const DEFAULT_REFUND_WINDOW_DAYS = 14;
export const DEFAULT_MAX_AMOUNT_USD = 10000;
export const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 300;

export function isValidPaymentStatus(status) {
  return PAYMENT_STATUS_VALUES.includes(status);
}

export function isValidPaymentProvider(provider) {
  return PAYMENT_PROVIDER_VALUES.includes(provider);
}

export function isValidPaymentPurpose(purpose) {
  return PAYMENT_PURPOSE_VALUES.includes(purpose);
}

export function isValidRefundStatus(status) {
  return REFUND_STATUS_VALUES.includes(status);
}

export function isValidInvoiceStatus(status) {
  return INVOICE_STATUS_VALUES.includes(status);
}

export function isFinalPaymentStatus(status) {
  return FINAL_PAYMENT_STATUSES.includes(status);
}

export function isSuccessfulPayment(status) {
  return SUCCESSFUL_PAYMENT_STATUSES.includes(status);
}
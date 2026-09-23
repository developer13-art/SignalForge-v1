/**
 * Payment Event Helpers
 *
 * @module signalforge/server/modules/payments/events
 */

import { getEventBus } from '../../bootstrap/initEventBus.js';
import { PAYMENT_EVENTS } from './payment.constants.js';

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'payments',
    sourceVersion: '1.0.0',
    ...options,
  });
}

export function emitPaymentInitiated(userId, paymentId, provider, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_INITIATED, {
    userId,
    paymentId,
    provider,
    amount,
    initiatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPaymentPending(userId, paymentId, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_PENDING, {
    userId,
    paymentId,
    pendingAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPaymentCompleted(userId, paymentId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_COMPLETED, {
    userId,
    paymentId,
    amount,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPaymentFailed(userId, paymentId, reason, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_FAILED, {
    userId,
    paymentId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPaymentCancelled(userId, paymentId, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_CANCELLED, {
    userId,
    paymentId,
    cancelledAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPaymentRefunded(userId, paymentId, refundId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_REFUNDED, {
    userId,
    paymentId,
    refundId,
    amount,
    refundedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPaymentPartiallyRefunded(userId, paymentId, refundId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_PARTIALLY_REFUNDED, {
    userId,
    paymentId,
    refundId,
    amount,
    refundedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPaymentDisputed(userId, paymentId, reason, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_DISPUTED, {
    userId,
    paymentId,
    reason,
    disputedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitPaymentRequiresAction(userId, paymentId, action, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_REQUIRES_ACTION, {
    userId,
    paymentId,
    action,
    flaggedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWebhookReceived(provider, eventType, externalEventId, meta = {}) {
  return publish(PAYMENT_EVENTS.WEBHOOK_RECEIVED, {
    provider,
    eventType,
    externalEventId,
    receivedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWebhookVerified(provider, externalEventId, meta = {}) {
  return publish(PAYMENT_EVENTS.WEBHOOK_VERIFIED, {
    provider,
    externalEventId,
    verifiedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitWebhookFailed(provider, externalEventId, error, meta = {}) {
  return publish(PAYMENT_EVENTS.WEBHOOK_FAILED, {
    provider,
    externalEventId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitInvoiceCreated(userId, invoiceId, number, meta = {}) {
  return publish(PAYMENT_EVENTS.INVOICE_CREATED, {
    userId,
    invoiceId,
    number,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitInvoicePaid(userId, invoiceId, number, meta = {}) {
  return publish(PAYMENT_EVENTS.INVOICE_PAID, {
    userId,
    invoiceId,
    number,
    paidAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitInvoiceVoided(userId, invoiceId, number, meta = {}) {
  return publish(PAYMENT_EVENTS.INVOICE_VOIDED, {
    userId,
    invoiceId,
    number,
    voidedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRefundInitiated(userId, refundId, paymentId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.REFUND_INITIATED, {
    userId,
    refundId,
    paymentId,
    amount,
    initiatedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRefundCompleted(userId, refundId, paymentId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.REFUND_COMPLETED, {
    userId,
    refundId,
    paymentId,
    amount,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}

export function emitRefundFailed(userId, refundId, paymentId, error, meta = {}) {
  return publish(PAYMENT_EVENTS.REFUND_FAILED, {
    userId,
    refundId,
    paymentId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

export { PAYMENT_EVENTS };
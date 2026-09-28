/**
 * Payment Event Helpers
 *
 * @module signalforge/server/modules/payments/events
 */
const { getEventBus } = require('../../bootstrap/initEventBus.js');
const { PAYMENT_EVENTS } = require('./payment.constants.js');

function publish(eventType, payload, options = {}) {
  const bus = getEventBus();
  return bus.publish(eventType, payload, {
    source: 'payments',
    sourceVersion: '1.0.0',
    ...options,
  });
}
function emitPaymentInitiated(userId, paymentId, provider, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_INITIATED, {
    userId,
    paymentId,
    provider,
    amount,
    initiatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPaymentPending(userId, paymentId, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_PENDING, {
    userId,
    paymentId,
    pendingAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPaymentCompleted(userId, paymentId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_COMPLETED, {
    userId,
    paymentId,
    amount,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPaymentFailed(userId, paymentId, reason, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_FAILED, {
    userId,
    paymentId,
    reason,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPaymentCancelled(userId, paymentId, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_CANCELLED, {
    userId,
    paymentId,
    cancelledAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPaymentRefunded(userId, paymentId, refundId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_REFUNDED, {
    userId,
    paymentId,
    refundId,
    amount,
    refundedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPaymentPartiallyRefunded(userId, paymentId, refundId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_PARTIALLY_REFUNDED, {
    userId,
    paymentId,
    refundId,
    amount,
    refundedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPaymentDisputed(userId, paymentId, reason, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_DISPUTED, {
    userId,
    paymentId,
    reason,
    disputedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitPaymentRequiresAction(userId, paymentId, action, meta = {}) {
  return publish(PAYMENT_EVENTS.PAYMENT_REQUIRES_ACTION, {
    userId,
    paymentId,
    action,
    flaggedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWebhookReceived(provider, eventType, externalEventId, meta = {}) {
  return publish(PAYMENT_EVENTS.WEBHOOK_RECEIVED, {
    provider,
    eventType,
    externalEventId,
    receivedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWebhookVerified(provider, externalEventId, meta = {}) {
  return publish(PAYMENT_EVENTS.WEBHOOK_VERIFIED, {
    provider,
    externalEventId,
    verifiedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitWebhookFailed(provider, externalEventId, error, meta = {}) {
  return publish(PAYMENT_EVENTS.WEBHOOK_FAILED, {
    provider,
    externalEventId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitInvoiceCreated(userId, invoiceId, number, meta = {}) {
  return publish(PAYMENT_EVENTS.INVOICE_CREATED, {
    userId,
    invoiceId,
    number,
    createdAt: new Date().toISOString(),
    ...meta,
  });
}
function emitInvoicePaid(userId, invoiceId, number, meta = {}) {
  return publish(PAYMENT_EVENTS.INVOICE_PAID, {
    userId,
    invoiceId,
    number,
    paidAt: new Date().toISOString(),
    ...meta,
  });
}
function emitInvoiceVoided(userId, invoiceId, number, meta = {}) {
  return publish(PAYMENT_EVENTS.INVOICE_VOIDED, {
    userId,
    invoiceId,
    number,
    voidedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRefundInitiated(userId, refundId, paymentId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.REFUND_INITIATED, {
    userId,
    refundId,
    paymentId,
    amount,
    initiatedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRefundCompleted(userId, refundId, paymentId, amount, meta = {}) {
  return publish(PAYMENT_EVENTS.REFUND_COMPLETED, {
    userId,
    refundId,
    paymentId,
    amount,
    completedAt: new Date().toISOString(),
    ...meta,
  });
}
function emitRefundFailed(userId, refundId, paymentId, error, meta = {}) {
  return publish(PAYMENT_EVENTS.REFUND_FAILED, {
    userId,
    refundId,
    paymentId,
    error: typeof error === 'string' ? error : error.message,
    failedAt: new Date().toISOString(),
    ...meta,
  });
}

module.exports.emitPaymentInitiated = emitPaymentInitiated;
module.exports.emitPaymentPending = emitPaymentPending;
module.exports.emitPaymentCompleted = emitPaymentCompleted;
module.exports.emitPaymentFailed = emitPaymentFailed;
module.exports.emitPaymentCancelled = emitPaymentCancelled;
module.exports.emitPaymentRefunded = emitPaymentRefunded;
module.exports.emitPaymentPartiallyRefunded = emitPaymentPartiallyRefunded;
module.exports.emitPaymentDisputed = emitPaymentDisputed;
module.exports.emitPaymentRequiresAction = emitPaymentRequiresAction;
module.exports.emitWebhookReceived = emitWebhookReceived;
module.exports.emitWebhookVerified = emitWebhookVerified;
module.exports.emitWebhookFailed = emitWebhookFailed;
module.exports.emitInvoiceCreated = emitInvoiceCreated;
module.exports.emitInvoicePaid = emitInvoicePaid;
module.exports.emitInvoiceVoided = emitInvoiceVoided;
module.exports.emitRefundInitiated = emitRefundInitiated;
module.exports.emitRefundCompleted = emitRefundCompleted;
module.exports.emitRefundFailed = emitRefundFailed;

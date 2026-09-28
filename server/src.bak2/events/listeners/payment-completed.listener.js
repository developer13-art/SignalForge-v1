/**
 * Payment Completed Listener
 *
 * @module server/events/listeners/payment-completed.listener
 */
const { subscribeToEvent } = require('../event-subscriber');
const { EVENT_TYPES } = require('../event-types');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.userId) {
    return;
  }

  await db.query(
    `INSERT INTO notifications (user_id, type, category, priority, title, body, channels, status, created_at, updated_at)
     VALUES ($1, 'PAYMENT_SUCCESSFUL', 'PAYMENT', 'NORMAL', $2, $3, $4, 'QUEUED', NOW(), NOW())`,
    [
      payload.userId,
      'Payment received',
      `We received your payment of ${payload.amount} ${payload.currency}.`,
      JSON.stringify(['IN_APP', 'EMAIL']),
    ],
  );

  logger.debug({ userId: payload.userId }, 'Payment confirmation handled');
}
function registerPaymentCompletedListener() {
  subscribeToEvent(EVENT_TYPES.PAYMENT_COMPLETED, handler);
}
module.exports.registerPaymentCompletedListener = registerPaymentCompletedListener;

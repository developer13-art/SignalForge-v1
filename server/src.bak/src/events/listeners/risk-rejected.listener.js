/**
 * Risk Rejected Listener
 *
 * @module server/events/listeners/risk-rejected.listener
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
     VALUES ($1, 'SIGNAL_REJECTED', 'RISK', 'NORMAL', $2, $3, $4, 'QUEUED', NOW(), NOW())`,
    [
      payload.userId,
      'Signal rejected by risk engine',
      payload.reason || 'Risk check failed',
      JSON.stringify(['IN_APP']),
    ],
  );

  logger.debug({ userId: payload.userId }, 'Risk rejected notification queued');
}
function registerRiskRejectedListener() {
  subscribeToEvent(EVENT_TYPES.RISK_REJECTED, handler);
}
module.exports.registerRiskRejectedListener = registerRiskRejectedListener;

/**
 * KYC Approved Listener
 *
 * @module server/events/listeners/kyc-approved.listener
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
     VALUES ($1, 'KYC_APPROVED', 'KYC', 'NORMAL', $2, $3, $4, 'QUEUED', NOW(), NOW())`,
    [
      payload.userId,
      'Identity verified',
      'Your identity verification has been approved. You now have full access.',
      JSON.stringify(['IN_APP', 'EMAIL']),
    ],
  );

  logger.debug({ userId: payload.userId }, 'KYC approval handled');
}
function registerKycApprovedListener() {
  subscribeToEvent(EVENT_TYPES.KYC_APPROVED, handler);
}
module.exports.registerKycApprovedListener = registerKycApprovedListener;

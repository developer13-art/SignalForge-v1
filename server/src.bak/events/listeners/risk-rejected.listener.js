/**
 * Risk Rejected Listener
 *
 * @module server/events/listeners/risk-rejected.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';
import { db } from '../../database';

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

export function registerRiskRejectedListener() {
  subscribeToEvent(EVENT_TYPES.RISK_REJECTED, handler);
}
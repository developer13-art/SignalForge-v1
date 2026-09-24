/**
 * Risk Approved Listener
 *
 * @module server/events/listeners/risk-approved.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.tradeId) {
    return;
  }

  await db.query(
    `INSERT INTO jobs (job_type, payload, status, priority, scheduled_at, created_at, updated_at)
     VALUES ('EXECUTE_TRADE', $1, 'PENDING', 90, NOW(), NOW(), NOW())`,
    [JSON.stringify({ tradeId: payload.tradeId, userId: payload.userId })],
  );

  logger.debug({ tradeId: payload.tradeId }, 'Execution job enqueued for risk-approved trade');
}

export function registerRiskApprovedListener() {
  subscribeToEvent(EVENT_TYPES.RISK_APPROVED, handler);
}
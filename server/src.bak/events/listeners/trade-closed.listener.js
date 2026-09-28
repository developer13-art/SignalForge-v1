/**
 * Trade Closed Listener
 *
 * @module server/events/listeners/trade-closed.listener
 */

import { subscribeToEvent } from '../event-subscriber';
import { EVENT_TYPES } from '../event-types';
import { logger } from '../../lib/logger';
import { db } from '../../database';

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.tradeId || !payload.userId) {
    return;
  }

  await db.query(
    `INSERT INTO notifications (user_id, type, category, priority, title, body, channels, status, created_at, updated_at)
     VALUES ($1, 'TRADE_CLOSED', 'TRADE', 'NORMAL', $2, $3, $4, 'QUEUED', NOW(), NOW())`,
    [
      payload.userId,
      `Trade closed: ${payload.direction} ${payload.symbol}`,
      `Realized P/L: ${payload.realizedProfit ?? 'N/A'}`,
      JSON.stringify(['IN_APP']),
    ],
  );

  if (payload.userId) {
    await db.query(
      `INSERT INTO jobs (job_type, payload, status, priority, scheduled_at, created_at, updated_at)
       VALUES ('CALCULATE_PERFORMANCE', $1, 'PENDING', 40, NOW(), NOW(), NOW())`,
      [JSON.stringify({ userId: payload.userId })],
    );
  }

  logger.debug({ tradeId: payload.tradeId }, 'Trade closed handled');
}

export function registerTradeClosedListener() {
  subscribeToEvent(EVENT_TYPES.TRADE_CLOSED, handler);
}
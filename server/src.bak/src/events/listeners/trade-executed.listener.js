/**
 * Trade Executed Listener
 *
 * @module server/events/listeners/trade-executed.listener
 */
const { subscribeToEvent } = require('../event-subscriber');
const { EVENT_TYPES } = require('../event-types');
const { logger } = require('../../lib/logger');
const { db } = require('../../database');

async function handler(envelope) {
  const payload = envelope.payload || {};

  if (!payload.tradeId || !payload.userId) {
    return;
  }

  await db.query(
    `INSERT INTO notifications (user_id, type, category, priority, title, body, channels, status, created_at, updated_at)
     VALUES ($1, 'TRADE_OPENED', 'TRADE', 'NORMAL', $2, $3, $4, 'QUEUED', NOW(), NOW())`,
    [
      payload.userId,
      `Trade opened: ${payload.direction} ${payload.symbol}`,
      `Volume ${payload.volume} at ${payload.entryPrice}`,
      JSON.stringify(['IN_APP', 'PUSH']),
    ],
  );

  logger.debug({ tradeId: payload.tradeId }, 'Trade opened notification queued');
}
function registerTradeExecutedListener() {
  subscribeToEvent(EVENT_TYPES.TRADE_EXECUTED, handler);
}
module.exports.registerTradeExecutedListener = registerTradeExecutedListener;

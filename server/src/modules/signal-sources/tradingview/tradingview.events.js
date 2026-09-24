/**
 * TradingView Events
 *
 * Defines TradingView-specific event names and helpers for publishing
 * TradingView integration events on the platform Event Bus.
 *
 * @module server/modules/signal-sources/tradingview/tradingview.events
 */

import { EVENT_TYPES } from '@signalforge/shared/constants/event-types';
import { SOURCE_TYPES } from '@signalforge/shared/constants/source-types';
import { publishEvent } from '../../../events/event-publisher';

const SOURCE = 'tradingview.events';

export async function emitTradingViewWebhookReceived({ userId, alertId, symbol, direction }) {
  return publishEvent({
    eventType: EVENT_TYPES.MESSAGE_RECEIVED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      alertId: alertId || null,
      symbol: symbol || null,
      direction: direction || null,
      receivedAt: new Date().toISOString(),
    },
  });
}

export async function emitTradingViewWebhookRejected({ userId, reason, alertId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      alertId: alertId || null,
      reason: reason || null,
      rejectedAt: new Date().toISOString(),
    },
  });
}

export async function emitTradingViewAlertRegistered({ userId, alertId, symbol }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      alertId: alertId || null,
      symbol: symbol || null,
      registeredAt: new Date().toISOString(),
    },
  });
}

export async function emitTradingViewAlertRemoved({ userId, alertId }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      alertId: alertId || null,
      removedAt: new Date().toISOString(),
    },
  });
}

export async function emitTradingViewHealthCheck({ userId, healthy, details }) {
  return publishEvent({
    eventType: EVENT_TYPES.SOURCE_HEALTH_CHECK,
    source: SOURCE,
    actorId: userId,
    payload: {
      sourceType: SOURCE_TYPES.TRADINGVIEW,
      userId,
      healthy,
      details: details || null,
      checkedAt: new Date().toISOString(),
    },
  });
}

export const TRADINGVIEW_EVENT_NAMES = Object.freeze({
  WEBHOOK_RECEIVED: EVENT_TYPES.MESSAGE_RECEIVED,
  WEBHOOK_REJECTED: EVENT_TYPES.SOURCE_WEBHOOK_REJECTED,
  ALERT_REGISTERED: EVENT_TYPES.SOURCE_CHANNEL_OPT_IN,
  ALERT_REMOVED: EVENT_TYPES.SOURCE_CHANNEL_OPT_OUT,
  HEALTH_CHECK: EVENT_TYPES.SOURCE_HEALTH_CHECK,
});
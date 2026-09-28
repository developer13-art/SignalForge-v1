/**
 * Trade Event Stream Service
 *
 * Provides subscription helpers and real-time event delivery for
 * trade event consumers (WebSocket, notifications, analytics).
 *
 * @module signalforge/server/modules/trade-state/events/stream
 */

import { getEventBus } from '../../../bootstrap/initEventBus.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import { TRADE_STATE_EVENTS } from '../trade-state.constants.js';

export class TradeEventStreamService {
  constructor() {
    this.logger = getLogger('trade-event-stream');
    this.subscriptions = new Map();
  }

  subscribe(eventType, handler) {
    const bus = getEventBus();
    const unsubscribe = bus.subscribe(eventType, handler);
    const subscriptionId = `sub:${eventType}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    this.subscriptions.set(subscriptionId, unsubscribe);
    return subscriptionId;
  }

  unsubscribe(subscriptionId) {
    const unsubscribe = this.subscriptions.get(subscriptionId);
    if (unsubscribe) {
      try {
        unsubscribe();
      } catch (error) {
        this.logger.warn({ err: error, subscriptionId }, 'Failed to unsubscribe');
      }
      this.subscriptions.delete(subscriptionId);
    }
  }

  subscribeToAllTradeEvents(handler) {
    const subscriptionIds = [];
    for (const eventType of Object.values(TRADE_STATE_EVENTS)) {
      subscriptionIds.push(this.subscribe(eventType, handler));
    }
    return subscriptionIds;
  }

  subscribeToStateChanges(handler) {
    return this.subscribe(TRADE_STATE_EVENTS.STATE_CHANGED, handler);
  }

  subscribeToTradeEvents(tradeId, handler) {
    return this.subscribe(TRADE_STATE_EVENTS.EVENT_RECORDED, (envelope) => {
      if (envelope.payload?.tradeId === tradeId) {
        handler(envelope);
      }
    });
  }

  unsubscribeAll() {
    for (const [id, unsubscribe] of this.subscriptions.entries()) {
      try {
        unsubscribe();
      } catch (error) {
        this.logger.warn({ err: error, id }, 'Failed to unsubscribe');
      }
    }
    this.subscriptions.clear();
  }
}

export default TradeEventStreamService;
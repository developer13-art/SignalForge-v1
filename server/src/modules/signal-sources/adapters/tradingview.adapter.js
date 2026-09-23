/**
 * TradingView Adapter
 *
 * @module signalforge/server/modules/signal-sources/adapters/tradingview
 */

import { BaseAdapter } from './base.adapter.js';
import { SOURCE_TYPES } from '../source.constants.js';

export class TradingViewAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = SOURCE_TYPES.TRADINGVIEW;
  }

  async connect() {
    return { connected: true, adapter: this.name };
  }

  async disconnect() {
    return { disconnected: true };
  }

  async startListener() {
    return { stop: async () => {} };
  }

  async stopListener() {
    return { stopped: true };
  }

  normalizeMessage(rawMessage) {
    if (!rawMessage || typeof rawMessage !== 'object') {
      return null;
    }
    const text =
      typeof rawMessage === 'string'
        ? rawMessage
        : rawMessage.message || JSON.stringify(rawMessage);
    return {
      externalMessageId: rawMessage.id || `tv-${Date.now()}`,
      channelId: rawMessage.webhookId || 'tradingview-default',
      senderId: rawMessage.webhookId || null,
      senderName: 'TradingView',
      text,
      media: [],
      replyTo: null,
      edited: false,
      deleted: false,
      timestamp: rawMessage.timestamp || new Date().toISOString(),
      raw: rawMessage,
    };
  }
}

export default TradingViewAdapter;
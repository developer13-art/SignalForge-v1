/**
 * REST API Adapter
 *
 * @module signalforge/server/modules/signal-sources/adapters/rest-api
 */

import { BaseAdapter } from './base.adapter.js';
import { SOURCE_TYPES } from '../source.constants.js';

export class RestApiAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = SOURCE_TYPES.REST_API;
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
      typeof rawMessage === 'string' ? rawMessage : rawMessage.message || JSON.stringify(rawMessage);
    return {
      externalMessageId: rawMessage.id || rawMessage.messageId || `api-${Date.now()}`,
      channelId: rawMessage.sourceId || rawMessage.channelId || 'rest-api-default',
      senderId: rawMessage.providerId || rawMessage.senderId || null,
      senderName: rawMessage.providerName || null,
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

export default RestApiAdapter;
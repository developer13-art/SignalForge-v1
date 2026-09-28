/**
 * WhatsApp Adapter
 *
 * @module signalforge/server/modules/signal-sources/adapters/whatsapp
 */

import { BaseAdapter } from './base.adapter.js';
import { SOURCE_TYPES } from '../source.constants.js';

export class WhatsAppAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = SOURCE_TYPES.WHATSAPP;
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

  async discoverChannels() {
    return [];
  }

  normalizeMessage(rawMessage) {
    if (!rawMessage || typeof rawMessage !== 'object') {
      return null;
    }
    const message = rawMessage.messages?.[0] || rawMessage;
    return {
      externalMessageId: message.id,
      channelId: rawMessage.metadata?.phone_number_id || message.from,
      senderId: message.from,
      senderName: rawMessage.contacts?.[0]?.profile?.name || null,
      text: message.text?.body || '',
      media: message.image || message.document ? [message.image || message.document] : [],
      replyTo: message.context?.id || null,
      edited: false,
      deleted: false,
      timestamp: new Date(Number(message.timestamp) * 1000).toISOString(),
    };
  }
}

export default WhatsAppAdapter;
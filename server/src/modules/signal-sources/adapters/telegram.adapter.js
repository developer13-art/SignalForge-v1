/**
 * Telegram Adapter
 *
 * Bridges the Telegram User Session listener into the shared adapter
 * interface used by the Signal Source module.
 *
 * @module signalforge/server/modules/signal-sources/adapters/telegram
 */

import { BaseAdapter } from './base.adapter.js';
import { SOURCE_TYPES } from '../source.constants.js';

export class TelegramAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = SOURCE_TYPES.TELEGRAM;
    this.client = config.client || null;
    this.session = config.session || null;
    this.listener = null;
  }

  async connect() {
    if (!this.client) {
      throw new Error('Telegram client is required');
    }
    return { connected: true, adapter: this.name };
  }

  async disconnect() {
    if (this.listener) {
      await this.listener.stop();
      this.listener = null;
    }
    return { disconnected: true };
  }

  async startListener(handlers) {
    if (!this.client) {
      throw new Error('Telegram client is required');
    }
    this.listener = { stop: async () => {} };
    return this.listener;
  }

  async stopListener() {
    if (this.listener) {
      await this.listener.stop();
      this.listener = null;
    }
    return { stopped: true };
  }

  async discoverChannels() {
    return [];
  }

  async optInChannel(channelId) {
    return { channelId, status: 'OPTED_IN' };
  }

  async optOutChannel(channelId) {
    return { channelId, status: 'OPTED_OUT' };
  }

  normalizeMessage(rawMessage) {
    if (!rawMessage || typeof rawMessage !== 'object') {
      return null;
    }
    return {
      externalMessageId: rawMessage.id || rawMessage.messageId,
      channelId: rawMessage.channelId || rawMessage.chatId,
      senderId: rawMessage.senderId,
      senderName: rawMessage.senderName,
      text: rawMessage.text || rawMessage.message || '',
      media: rawMessage.media || [],
      replyTo: rawMessage.replyTo || null,
      edited: rawMessage.edited === true,
      deleted: rawMessage.deleted === true,
      timestamp: rawMessage.date || rawMessage.timestamp || new Date().toISOString(),
    };
  }
}

export default TelegramAdapter;
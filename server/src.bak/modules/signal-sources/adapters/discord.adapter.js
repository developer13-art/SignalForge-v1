/**
 * Discord Adapter
 *
 * @module signalforge/server/modules/signal-sources/adapters/discord
 */

import { BaseAdapter } from './base.adapter.js';
import { SOURCE_TYPES } from '../source.constants.js';

export class DiscordAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = SOURCE_TYPES.DISCORD;
    this.client = config.client || null;
    this.listener = null;
  }

  async connect() {
    if (!this.client) {
      throw new Error('Discord client is required');
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

  async startListener() {
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

  normalizeMessage(rawMessage) {
    if (!rawMessage || typeof rawMessage !== 'object') {
      return null;
    }
    return {
      externalMessageId: rawMessage.id,
      channelId: rawMessage.channelId,
      guildId: rawMessage.guildId,
      senderId: rawMessage.author?.id,
      senderName: rawMessage.author?.username,
      text: rawMessage.content || '',
      media: rawMessage.attachments || [],
      replyTo: rawMessage.reference?.messageId || null,
      edited: Boolean(rawMessage.editedTimestamp),
      deleted: false,
      timestamp: rawMessage.createdAt || new Date().toISOString(),
    };
  }
}

export default DiscordAdapter;
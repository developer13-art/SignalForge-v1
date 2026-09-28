/**
 * Email Adapter
 *
 * @module signalforge/server/modules/signal-sources/adapters/email
 */
const { BaseAdapter } = require('./base.adapter.js');
const { SOURCE_TYPES } = require('../source.constants.js');

export class EmailAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = SOURCE_TYPES.EMAIL;
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
    const text = rawMessage.text || rawMessage.html || '';
    return {
      externalMessageId: rawMessage.messageId,
      channelId: rawMessage.mailbox || 'INBOX',
      senderId: rawMessage.from?.address || rawMessage.from,
      senderName: rawMessage.from?.name || null,
      subject: rawMessage.subject || null,
      text,
      media: rawMessage.attachments || [],
      replyTo: rawMessage.inReplyTo || null,
      edited: false,
      deleted: false,
      timestamp: rawMessage.date || new Date().toISOString(),
    };
  }
}
module.exports = EmailAdapter;
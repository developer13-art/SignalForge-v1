/**
 * Message Normalizer Service
 *
 * Applies field normalization and sanitization to incoming messages
 * before they are stored. Ensures a consistent shape across sources.
 *
 * @module signalforge/server/modules/signal-sources/messages/normalizer
 */

import { MAX_MESSAGE_TEXT_LENGTH, MESSAGE_SOURCES } from '../source.constants.js';

export class MessageNormalizerService {
  sanitizeText(text) {
    if (typeof text !== 'string') {
      return '';
    }
    const trimmed = text.trim();
    if (trimmed.length > MAX_MESSAGE_TEXT_LENGTH) {
      return `${trimmed.substring(0, MAX_MESSAGE_TEXT_LENGTH - 3)}...`;
    }
    return trimmed;
  }

  normalizeTimestamp(input) {
    if (!input) {
      return new Date().toISOString();
    }
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      return new Date().toISOString();
    }
    return parsed.toISOString();
  }

  normalizeMedia(media) {
    if (!Array.isArray(media)) {
      return [];
    }
    return media
      .filter((m) => m && typeof m === 'object')
      .map((m) => ({
        type: m.type || 'unknown',
        url: m.url || null,
        fileId: m.fileId || m.id || null,
        mimeType: m.mimeType || null,
        size: m.size || null,
      }));
  }

  normalize(message) {
    if (!message || typeof message !== 'object') {
      throw new Error('Message must be an object');
    }
    return {
      externalMessageId: String(message.externalMessageId || ''),
      channelId: message.channelId ? String(message.channelId) : null,
      channelType: MESSAGE_SOURCES.CHANNEL,
      senderId: message.senderId ? String(message.senderId) : null,
      senderName: message.senderName || null,
      subject: message.subject || null,
      text: this.sanitizeText(message.text),
      media: this.normalizeMedia(message.media),
      replyTo: message.replyTo ? String(message.replyTo) : null,
      edited: message.edited === true,
      deleted: message.deleted === true,
      timestamp: this.normalizeTimestamp(message.timestamp),
      raw: message.raw || null,
    };
  }
}

export default MessageNormalizerService;
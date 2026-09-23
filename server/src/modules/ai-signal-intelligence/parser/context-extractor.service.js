/**
 * Context Extractor Service
 *
 * Gathers optional context from the message envelope such as the
 * reply-to reference, media, and the surrounding message history.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/parser/context
 */

import { MAX_CONTEXT_MESSAGES } from '../ai.constants.js';

export class ContextExtractorService {
  extractContext(message, history = []) {
    if (!message || typeof message !== 'object') {
      return null;
    }

    const recentHistory = Array.isArray(history)
      ? history.slice(0, MAX_CONTEXT_MESSAGES)
      : [];

    return {
      replyTo: message.replyTo || null,
      hasMedia: Array.isArray(message.media) && message.media.length > 0,
      channelId: message.channelId || null,
      senderName: message.senderName || null,
      history: recentHistory.map((m) => ({
        text: m.messageText || m.text || '',
        timestamp: m.timestamp || null,
        senderName: m.senderName || null,
      })),
    };
  }
}

export default ContextExtractorService;
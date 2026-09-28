/**
 * Message Idempotency Service
 *
 * Prevents duplicate processing of redelivered messages using
 * idempotency keys scoped to source type, source id, and external
 * message id.
 *
 * @module signalforge/server/modules/signal-sources/messages/idempotency
 */
const { buildSourceMessageKey } = require('@signalforge/shared/utils/idempotency.util');
const { MessageRepository } = require('./message.repository.js');

export class MessageIdempotencyService {
  constructor(repository = null) {
    this.repository = repository || new MessageRepository();
  }

  buildKey(sourceType, sourceId, externalMessageId) {
    return buildSourceMessageKey(sourceType, sourceId, externalMessageId);
  }

  async exists(idempotencyKey) {
    const found = await this.repository.findByIdempotencyKey(idempotencyKey);
    return found !== null;
  }

  async check(sourceType, sourceId, externalMessageId) {
    const key = this.buildKey(sourceType, sourceId, externalMessageId);
    const exists = await this.exists(key);
    return { key, duplicate: exists };
  }
}
module.exports = MessageIdempotencyService;
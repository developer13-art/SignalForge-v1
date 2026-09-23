/**
 * Message Service
 *
 * Persists raw messages, computes idempotency keys, and hands off
 * the message to the signal pipeline.
 *
 * @module signalforge/server/modules/signal-sources/messages/service
 */

import crypto from 'node:crypto';

import { MessageRepository } from './message.repository.js';
import { buildSourceMessageKey } from '@signalforge/shared/utils/idempotency.util';
import { SOURCE_EVENTS } from '../source.constants.js';
import { getEventBus } from '../../../bootstrap/initEventBus.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import { MessageNotFoundError } from '../source.errors.js';

export class MessageService {
  constructor(repository = null) {
    this.repository = repository || new MessageRepository();
    this.logger = getLogger('source-messages');
  }

  buildIdempotencyKey(sourceType, sourceId, externalMessageId) {
    return buildSourceMessageKey(sourceType, sourceId, externalMessageId);
  }

  hashPayload(payload) {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  async ingest(source, normalizedMessage) {
    if (!normalizedMessage || !normalizedMessage.externalMessageId) {
      throw new Error('Normalized message must include externalMessageId');
    }

    const idempotencyKey = this.buildIdempotencyKey(
      source.source_type,
      source.id,
      normalizedMessage.externalMessageId,
    );

    const rawPayloadHash = this.hashPayload(normalizedMessage.raw || normalizedMessage);

    const created = await this.repository.create({
      sourceId: source.id,
      userId: source.user_id,
      externalMessageId: normalizedMessage.externalMessageId,
      channelId: normalizedMessage.channelId,
      senderId: normalizedMessage.senderId,
      senderName: normalizedMessage.senderName,
      messageText: normalizedMessage.text || '',
      mediaReference: normalizedMessage.media || null,
      replyTo: normalizedMessage.replyTo,
      edited: normalizedMessage.edited,
      deleted: normalizedMessage.deleted,
      timestamp: normalizedMessage.timestamp,
      rawPayloadEncrypted: rawPayloadHash,
      processingStatus: 'RECEIVED',
      idempotencyKey,
    });

    if (!created) {
      this.logger.debug({ idempotencyKey }, 'Message already ingested, skipping');
      return { duplicate: true };
    }

    await getEventBus().publish(SOURCE_EVENTS.MESSAGE_RECEIVED, {
      sourceId: source.id,
      userId: source.user_id,
      messageId: created.id,
      externalMessageId: normalizedMessage.externalMessageId,
      channelId: normalizedMessage.channelId,
      sourceType: source.source_type,
      receivedAt: new Date().toISOString(),
    });

    return { duplicate: false, messageId: created.id };
  }

  async getById(messageId) {
    const message = await this.repository.findById(messageId);
    if (!message) {
      throw new MessageNotFoundError();
    }
    return this.serialize(message);
  }

  async getByIdForUser(messageId, userId) {
    const message = await this.repository.findByIdForUser(messageId, userId);
    if (!message) {
      throw new MessageNotFoundError();
    }
    return this.serialize(message);
  }

  async listForSource(sourceId, filters, pagination) {
    const result = await this.repository.listForSource(sourceId, filters, pagination);
    return {
      messages: result.messages.map((m) => this.serialize(m)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async updateStatus(messageId, status, errorReason = null) {
    await this.repository.updateProcessingStatus(messageId, status, errorReason);
    await getEventBus().publish(SOURCE_EVENTS.MESSAGE_PROCESSED, {
      messageId,
      status,
      errorReason,
      processedAt: new Date().toISOString(),
    });
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      sourceId: row.source_id,
      userId: row.user_id,
      externalMessageId: row.external_message_id,
      channelId: row.channel_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      messageText: row.message_text,
      mediaReference: row.media_reference,
      replyTo: row.reply_to,
      edited: row.edited,
      deleted: row.deleted,
      timestamp: row.timestamp,
      processingStatus: row.processing_status,
      errorReason: row.error_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default MessageService;
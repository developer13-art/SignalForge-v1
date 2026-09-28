/**
 * REST API Source Service
 *
 * @module signalforge/server/modules/signal-sources/rest-api/service
 */

import { RestApiRepository } from './rest-api.repository.js';
import { RestApiAuthService } from './rest-api-auth.service.js';
import { RestApiRateLimitService } from './rest-api-rate-limit.service.js';
import { MessageService } from '../messages/message.service.js';
import { MessageNormalizerService } from '../messages/message-normalizer.service.js';
import { RestApiAdapter } from '../adapters/rest-api.adapter.js';
import { emitMessageReceived } from '../source.events.js';
import { SourceConnectionError } from '../source.errors.js';

export class RestApiService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new RestApiRepository();
    this.auth = dependencies.auth || new RestApiAuthService(this.repository);
    this.rateLimit = dependencies.rateLimit || new RestApiRateLimitService();
    this.messageService = dependencies.messageService || new MessageService();
    this.normalizer = new MessageNormalizerService();
    this.adapter = new RestApiAdapter();
  }

  async createKey(userId, payload) {
    const { key, prefix } = this.auth.generateKey();
    const hashed = this.auth.hashKey(key);
    const created = await this.repository.createKey({
      userId,
      sourceId: payload.sourceId || null,
      name: payload.name,
      prefix,
      hashedKey: hashed,
    });
    return { ...created, key };
  }

  async listKeys(userId) {
    return this.repository.listKeysForUser(userId);
  }

  async updateKey(userId, keyId, payload) {
    await this.repository.updateKey(keyId, userId, payload);
    return { updated: true };
  }

  async deleteKey(userId, keyId) {
    await this.repository.deleteKey(keyId, userId);
    return { deleted: true };
  }

  async submitSignal(req, payload) {
    const record = await this.auth.authenticate(req);

    const keyId = record.id;
    const limit = this.rateLimit.check(`key:${keyId}`);
    if (!limit.allowed) {
      throw new SourceConnectionError('Rate limit exceeded');
    }

    const normalized = this.adapter.normalizeMessage(payload);
    const message = this.normalizer.normalize(normalized);

    const result = await this.messageService.ingest(
      {
        id: record.source_id || record.id,
        user_id: record.user_id,
        source_type: 'REST_API',
      },
      message,
    );

    if (!result.duplicate) {
      await emitMessageReceived(record.user_id, record.id, result.messageId, {
        channelId: normalized.channelId,
      });
    }

    return {
      processed: true,
      messageId: result.messageId,
      duplicate: result.duplicate,
    };
  }
}

export default RestApiService;
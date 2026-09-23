/**
 * Source Service
 *
 * @module signalforge/server/modules/signal-sources/service
 */

import { SourceRepository } from './source.repository.js';
import { MessageService } from './messages/message.service.js';
import { MessageNormalizerService } from './messages/message-normalizer.service.js';
import { AdapterRegistry } from './adapters/adapter.registry.js';
import { SOURCE_CONNECTION_STATUSES } from './source.constants.js';
import { SourceNotFoundError, SourceNotOwnedError } from './source.errors.js';
import {
  emitSourceCreated,
  emitSourceUpdated,
  emitSourceDeleted,
  emitSourceConnected,
  emitSourceDisconnected,
  emitSourceError,
} from './source.events.js';
import { getLogger } from '../../bootstrap/initLogger.js';

export class SourceService {
  constructor(repository = null, messageService = null) {
    this.repository = repository || new SourceRepository();
    this.messageService = messageService || new MessageService();
    this.normalizer = new MessageNormalizerService();
    this.logger = getLogger('source-service');
  }

  async create(userId, payload) {
    const created = await this.repository.create({
      userId,
      sourceType: payload.sourceType,
      name: payload.name,
      status: SOURCE_CONNECTION_STATUSES.PENDING,
      connectionConfig: payload.connectionConfig || null,
      metadata: payload.metadata || null,
      listenerEnabled: payload.listenerEnabled !== false,
    });

    await emitSourceCreated(userId, created.id, created.source_type);

    return this.serialize(created);
  }

  async getByIdForUser(sourceId, userId) {
    const source = await this.repository.findByIdForUser(sourceId, userId);
    if (!source) {
      throw new SourceNotFoundError();
    }
    return this.serialize(source);
  }

  async listForUser(userId, filters = {}) {
    const sources = await this.repository.listForUser(userId, filters);
    return sources.map((s) => this.serialize(s));
  }

  async update(sourceId, userId, payload) {
    const existing = await this.repository.findByIdForUser(sourceId, userId);
    if (!existing) {
      throw new SourceNotFoundError();
    }

    const updated = await this.repository.update(sourceId, userId, payload);

    await emitSourceUpdated(userId, sourceId, Object.keys(payload));

    return this.serialize(updated);
  }

  async delete(sourceId, userId) {
    const existing = await this.repository.findByIdForUser(sourceId, userId);
    if (!existing) {
      throw new SourceNotFoundError();
    }

    await this.repository.delete(sourceId, userId);

    await emitSourceDeleted(userId, sourceId);

    return { deleted: true };
  }

  async connect(sourceId, userId) {
    const existing = await this.repository.findByIdForUser(sourceId, userId);
    if (!existing) {
      throw new SourceNotFoundError();
    }

    await this.repository.updateStatus(sourceId, SOURCE_CONNECTION_STATUSES.CONNECTING);

    try {
      const adapter = AdapterRegistry.create(existing.source_type, {
        connectionConfig: existing.connection_config,
        session: existing.connection_config,
      });

      await adapter.connect();

      await this.repository.updateStatus(sourceId, SOURCE_CONNECTION_STATUSES.CONNECTED, {
        lastConnectedAt: new Date(),
      });

      await emitSourceConnected(userId, sourceId, existing.source_type);

      return { connected: true };
    } catch (error) {
      await this.repository.updateStatus(sourceId, SOURCE_CONNECTION_STATUSES.ERROR, {
        lastError: error.message,
        lastErrorAt: new Date(),
      });

      await emitSourceError(userId, sourceId, error);

      throw error;
    }
  }

  async disconnect(sourceId, userId) {
    const existing = await this.repository.findByIdForUser(sourceId, userId);
    if (!existing) {
      throw new SourceNotFoundError();
    }

    await this.repository.updateStatus(sourceId, SOURCE_CONNECTION_STATUSES.DISCONNECTED);

    await emitSourceDisconnected(userId, sourceId, 'user_action');

    return { disconnected: true };
  }

  async enable(sourceId, userId) {
    return this.update(sourceId, userId, { listenerEnabled: true });
  }

  async disable(sourceId, userId) {
    return this.update(sourceId, userId, { listenerEnabled: false });
  }

  async ingestMessage(sourceId, normalizedMessage) {
    const source = await this.repository.findById(sourceId);
    if (!source) {
      throw new SourceNotFoundError();
    }

    const normalized = this.normalizer.normalize(normalizedMessage);

    return this.messageService.ingest(source, normalized);
  }

  async listMessages(sourceId, userId, filters = {}, pagination = {}) {
    const source = await this.repository.findByIdForUser(sourceId, userId);
    if (!source) {
      throw new SourceNotFoundError();
    }
    return this.messageService.listForSource(sourceId, filters, pagination);
  }

  async getMessage(sourceId, userId, messageId) {
    const source = await this.repository.findByIdForUser(sourceId, userId);
    if (!source) {
      throw new SourceNotFoundError();
    }
    return this.messageService.getByIdForUser(messageId, userId);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      sourceType: row.source_type,
      name: row.name,
      status: row.status,
      listenerEnabled: row.listener_enabled,
      lastConnectedAt: row.last_connected_at,
      lastError: row.last_error,
      lastErrorAt: row.last_error_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default SourceService;
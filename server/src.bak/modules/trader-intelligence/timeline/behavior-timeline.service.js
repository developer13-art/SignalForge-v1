/**
 * Behavior Timeline Service
 *
 * @module signalforge/server/modules/trader-intelligence/timeline/service
 */

import { BehaviorTimelineRepository } from './repository.js';
import { emitTimelineUpdated } from '../intelligence.events.js';

export class BehaviorTimelineService {
  constructor(repository = null) {
    this.repository = repository || new BehaviorTimelineRepository();
  }

  async recordEvent(data) {
    const created = await this.repository.create({
      userId: data.userId,
      eventType: data.eventType,
      referenceId: data.referenceId || null,
      score: data.score ?? null,
      details: data.details || null,
      metadata: data.metadata || null,
      occurredAt: data.occurredAt || new Date(),
    });
    await emitTimelineUpdated(data.userId, created.event_type);
    return this.serialize(created);
  }

  async list(userId, filters = {}, pagination = {}) {
    const result = await this.repository.list(userId, filters, pagination);
    return {
      events: result.events.map((e) => this.serialize(e)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async clear(userId) {
    await this.repository.deleteForUser(userId);
    return { cleared: true };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      eventType: row.event_type,
      referenceId: row.reference_id,
      score: row.score,
      details: this.parseJson(row.details),
      metadata: this.parseJson(row.metadata),
      occurredAt: row.occurred_at,
      createdAt: row.created_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default BehaviorTimelineService;
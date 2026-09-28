/**
 * Trade Timeline Service
 *
 * @module signalforge/server/modules/trades/timeline/service
 */

import { TradeTimelineRepository } from './trade-timeline.repository.js';
import { emitTimelineRecorded } from '../trade.events.js';

export class TradeTimelineService {
  constructor(repository = null) {
    this.repository = repository || new TradeTimelineRepository();
  }

  async record(data) {
    const created = await this.repository.create(data);
    await emitTimelineRecorded(data.tradeId, created.id, {
      eventType: created.event_type,
      actor: created.actor,
    });
    return created;
  }

  async listForTrade(tradeId, filters = {}, pagination = {}) {
    const result = await this.repository.listByTrade(tradeId, filters, pagination);
    return {
      events: result.events.map((e) => this.serialize(e)),
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getLatest(tradeId) {
    const row = await this.repository.findLatest(tradeId);
    return this.serialize(row);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      tradeId: row.trade_id,
      userId: row.user_id,
      eventType: row.event_type,
      actor: row.actor,
      actorId: row.actor_id,
      previousState: row.previous_state,
      newState: row.new_state,
      payload: this.parseJson(row.payload),
      severity: row.severity,
      metadata: this.parseJson(row.metadata),
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

export default TradeTimelineService;
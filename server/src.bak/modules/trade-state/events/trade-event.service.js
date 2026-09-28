/**
 * Trade Event Service
 *
 * @module signalforge/server/modules/trade-state/events/service
 */

import { TradeEventRepository } from './trade-event.repository.js';
import { ActorAttributionService } from '../lifecycle/actor-attribution.service.js';
import { getLogger } from '../../../bootstrap/initLogger.js';
import {
  isValidTradeEvent,
  getEventSeverity,
} from '../trade-state.constants.js';
import { InvalidTradeEventError } from '../trade-state.errors.js';
import {
  emitEventRecorded,
  emitStateChanged,
} from '../trade-state.events.js';

export class TradeEventService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradeEventRepository();
    this.actorAttribution =
      dependencies.actorAttribution || new ActorAttributionService();
    this.logger = getLogger('trade-event');
  }

  async recordEvent(data) {
    if (!isValidTradeEvent(data.eventType)) {
      throw new InvalidTradeEventError(undefined, { eventType: data.eventType });
    }

    const actor =
      data.actor || this.actorAttribution.deriveActor(data.eventType, null);

    const severity = getEventSeverity(data.eventType);

    const created = await this.repository.create({
      tradeId: data.tradeId,
      userId: data.userId || null,
      eventType: data.eventType,
      actor,
      actorId: data.actorId || null,
      previousState: data.previousState || null,
      newState: data.newState || null,
      payload: data.payload || null,
      severity,
      metadata: data.metadata || null,
    });

    await emitEventRecorded(data.tradeId, created.id, created.event_type, {
      actor,
      severity,
    });

    if (data.previousState && data.newState && data.previousState !== data.newState) {
      await emitStateChanged(
        data.tradeId,
        data.previousState,
        data.newState,
        actor,
      );
    }

    return this.serialize(created);
  }

  async getEventById(eventId) {
    const row = await this.repository.findById(eventId);
    return this.serialize(row);
  }

  async listEventsByTrade(tradeId, filters = {}, pagination = {}) {
    const result = await this.repository.listByTrade(tradeId, filters, pagination);
    return {
      events: result.events.map((e) => this.serialize(e)),
      limit: result.limit,
      offset: result.offset,
    };
  }

  async listEventsByUser(userId, filters = {}, pagination = {}) {
    const result = await this.repository.listByUser(userId, filters, pagination);
    return {
      events: result.events.map((e) => this.serialize(e)),
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getEventCounts(tradeId) {
    return this.repository.countByType(tradeId);
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

export default TradeEventService;
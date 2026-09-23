/**
 * Trade State Service (facade)
 *
 * @module signalforge/server/modules/trade-state/service
 */

import crypto from 'node:crypto';

import { TradeStateRepository } from './trade-state.repository.js';
import { LifecycleService } from './lifecycle/lifecycle.service.js';
import { StateTransitions } from './lifecycle/state-transitions.js';
import { TransitionValidatorService } from './lifecycle/transition-validator.service.js';
import { ActorAttributionService } from './lifecycle/actor-attribution.service.js';
import { TradeEventService } from './events/trade-event.service.js';
import { TradeEventStreamService } from './events/trade-event-stream.service.js';
import {
  TRADE_STATES,
  TRADE_ACTORS,
  isTerminalState,
} from './trade-state.constants.js';
import { TradeNotFoundError } from './trade-state.errors.js';
import {
  emitTradeCreated,
  emitTradeUpdated,
  emitTradeClosed,
  emitTradeArchived,
} from './trade-state.events.js';

export class TradeStateService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradeStateRepository();
    this.transitions = dependencies.transitions || new StateTransitions();
    this.validator =
      dependencies.validator || new TransitionValidatorService(this.transitions);
    this.actorAttribution =
      dependencies.actorAttribution || new ActorAttributionService();

    this.events = dependencies.events || new TradeEventService({
      repository: this.repository,
      actorAttribution: this.actorAttribution,
    });

    this.lifecycle = dependencies.lifecycle || new LifecycleService({
      repository: this.repository,
      transitions: this.transitions,
      validator: this.validator,
      actorAttribution: this.actorAttribution,
      events: this.events,
    });

    this.stream = dependencies.stream || new TradeEventStreamService();
  }

  async createTrade(payload, meta = {}) {
    const tradeId = payload.tradeId || crypto.randomUUID();

    const created = await this.repository.create({
      tradeId,
      userId: payload.userId,
      brokerAccountId: payload.brokerAccountId,
      signalId: payload.signalId || null,
      providerId: payload.providerId || null,
      parentTradeId: payload.parentTradeId || null,
      symbol: payload.symbol,
      normalizedSymbol: payload.normalizedSymbol || payload.symbol,
      direction: payload.direction,
      entryType: payload.entryType || 'MARKET',
      requestedPrice: payload.requestedPrice ?? null,
      entryPrice: payload.entryPrice ?? null,
      exitPrice: payload.exitPrice ?? null,
      volume: payload.volume,
      remainingVolume: payload.remainingVolume ?? payload.volume,
      stopLoss: payload.stopLoss ?? null,
      takeProfit: payload.takeProfit ?? null,
      takeProfits: payload.takeProfits || null,
      magicNumber: payload.magicNumber ?? null,
      brokerOrderId: payload.brokerOrderId || null,
      brokerPositionId: payload.brokerPositionId || null,
      brokerTicket: payload.brokerTicket || null,
      platform: payload.platform || null,
      accountType: payload.accountType || null,
      status: payload.status || TRADE_STATES.SIGNAL_RECEIVED,
      realizedProfit: payload.realizedProfit ?? null,
      unrealizedProfit: payload.unrealizedProfit ?? null,
      commission: payload.commission ?? null,
      swap: payload.swap ?? null,
      openedAt: payload.openedAt || null,
      closedAt: payload.closedAt || null,
      openedBy: payload.openedBy || null,
      closedBy: payload.closedBy || null,
      rejectionReason: payload.rejectionReason || null,
      metadata: payload.metadata || null,
    });

    await this.events.recordEvent({
      tradeId: created.trade_id,
      userId: payload.userId,
      eventType: 'SIGNAL_RECEIVED',
      actor: TRADE_ACTORS.PROVIDER,
      previousState: null,
      newState: created.status,
      payload: { symbol: payload.symbol, direction: payload.direction },
    });

    await emitTradeCreated(created.trade_id, payload.userId, {
      symbol: created.symbol,
      direction: created.direction,
    });

    return this.serialize(created);
  }

  async getById(tradeId) {
    const row = await this.repository.findById(tradeId);
    if (!row) {
      throw new TradeNotFoundError(undefined, { tradeId });
    }
    return this.serialize(row);
  }

  async getBySignalId(signalId) {
    const row = await this.repository.findBySignalId(signalId);
    return this.serialize(row);
  }

  async updateTrade(tradeId, changes, meta = {}) {
    const existing = await this.repository.findById(tradeId);
    if (!existing) {
      throw new TradeNotFoundError(undefined, { tradeId });
    }

    this.validator.assertNotTerminal(existing.status);

    await this.repository.update(existing.id, changes);

    const updated = await this.repository.findById(existing.id);

    await emitTradeUpdated(existing.trade_id, Object.keys(changes), meta);

    return this.serialize(updated);
  }

  async transitionState(tradeId, eventType, options = {}) {
    return this.lifecycle.transition(tradeId, eventType, options);
  }

  async closeTrade(tradeId, closeData, meta = {}) {
    const existing = await this.repository.findById(tradeId);
    if (!existing) {
      throw new TradeNotFoundError(undefined, { tradeId });
    }

    this.validator.assertNotTerminal(existing.status);

    await this.repository.update(existing.id, {
      status: TRADE_STATES.CLOSED,
      exitPrice: closeData.exitPrice ?? null,
      realizedProfit: closeData.realizedProfit ?? null,
      commission: closeData.commission ?? null,
      swap: closeData.swap ?? null,
      closedAt: closeData.closedAt || new Date(),
      closedBy: closeData.closedBy || TRADE_ACTORS.BROKER,
    });

    await this.events.recordEvent({
      tradeId: existing.trade_id,
      userId: existing.user_id,
      eventType: closeData.eventType || 'CLOSED',
      actor: closeData.actor || TRADE_ACTORS.BROKER,
      actorId: closeData.actorId || null,
      previousState: existing.status,
      newState: TRADE_STATES.CLOSED,
      payload: closeData.payload || null,
    });

    await emitTradeClosed(existing.trade_id, meta);

    const updated = await this.repository.findById(existing.id);
    return this.serialize(updated);
  }

  async archiveTrade(tradeId, meta = {}) {
    const existing = await this.repository.findById(tradeId);
    if (!existing) {
      throw new TradeNotFoundError(undefined, { tradeId });
    }

    await this.repository.update(existing.id, {
      status: TRADE_STATES.ARCHIVED,
    });

    await this.events.recordEvent({
      tradeId: existing.trade_id,
      userId: existing.user_id,
      eventType: 'ARCHIVED',
      actor: TRADE_ACTORS.SYSTEM,
      previousState: existing.status,
      newState: TRADE_STATES.ARCHIVED,
    });

    await emitTradeArchived(existing.trade_id, meta);

    const updated = await this.repository.findById(existing.id);
    return this.serialize(updated);
  }

  async listTrades(filters, pagination) {
    const result = await this.repository.listTrades(filters, pagination);
    return {
      trades: result.trades.map((t) => this.serialize(t)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getTradeEvents(tradeId, filters, pagination) {
    return this.events.listEventsByTrade(tradeId, filters, pagination);
  }

  async getUserEvents(userId, filters, pagination) {
    return this.events.listEventsByUser(userId, filters, pagination);
  }

  async getEventCounts(tradeId) {
    return this.events.getEventCounts(tradeId);
  }

  async getStatusCounts(filters) {
    return this.repository.countByStatus(filters);
  }

  getAllowedTransitions(tradeId) {
    return this.lifecycle.getAllowedTransitions(tradeId);
  }

  async isTerminal(tradeId) {
    const row = await this.repository.findById(tradeId);
    if (!row) {
      throw new TradeNotFoundError(undefined, { tradeId });
    }
    return isTerminalState(row.status);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      tradeId: row.trade_id,
      userId: row.user_id,
      brokerAccountId: row.broker_account_id,
      signalId: row.signal_id,
      providerId: row.provider_id,
      parentTradeId: row.parent_trade_id,
      symbol: row.symbol,
      normalizedSymbol: row.normalized_symbol,
      direction: row.direction,
      entryType: row.entry_type,
      requestedPrice: row.requested_price,
      entryPrice: row.entry_price,
      exitPrice: row.exit_price,
      volume: row.volume,
      remainingVolume: row.remaining_volume,
      stopLoss: row.stop_loss,
      takeProfit: row.take_profit,
      takeProfits: this.parseJson(row.take_profits),
      magicNumber: row.magic_number,
      brokerOrderId: row.broker_order_id,
      brokerPositionId: row.broker_position_id,
      brokerTicket: row.broker_ticket,
      platform: row.platform,
      accountType: row.account_type,
      status: row.status,
      realizedProfit: row.realized_profit,
      unrealizedProfit: row.unrealized_profit,
      commission: row.commission,
      swap: row.swap,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
      openedBy: row.opened_by,
      closedBy: row.closed_by,
      rejectionReason: row.rejection_reason,
      metadata: this.parseJson(row.metadata),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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

export default TradeStateService;
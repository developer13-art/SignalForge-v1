/**
 * Trades Service (facade)
 *
 * @module signalforge/server/modules/trades/service
 */

import crypto from 'node:crypto';

import { TradeRepository } from './trade.repository.js';
import { TradeTimelineService } from './timeline/trade-timeline.service.js';
import { OpenPositionsQuery } from './queries/open-positions.query.js';
import { PendingOrdersQuery } from './queries/pending-orders.query.js';
import { ClosedTradesQuery } from './queries/closed-trades.query.js';
import { TradeHistoryQuery } from './queries/trade-history.query.js';
import { TradeDetailsQuery } from './queries/trade-details.query.js';
import { ManualOpenService } from './operations/manual-open.service.js';
import { ManualCloseService } from './operations/manual-close.service.js';
import { ManualModifyService } from './operations/manual-modify.service.js';
import { ManualInterventionService } from './operations/manual-intervention.service.js';
import { TradeNotFoundError } from './trade.errors.js';
import { TRADE_STATUSES } from './trade.constants.js';
import {
  emitTradeCreated,
  emitTradeUpdated,
  emitTradeClosed,
  emitTradeArchived,
} from './trade.events.js';

export class TradeService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradeRepository();
    this.timeline = dependencies.timeline || new TradeTimelineService();

    this.openPositions = dependencies.openPositions || new OpenPositionsQuery(this.repository);
    this.pendingOrders = dependencies.pendingOrders || new PendingOrdersQuery(this.repository);
    this.closedTrades = dependencies.closedTrades || new ClosedTradesQuery(this.repository);
    this.history = dependencies.history || new TradeHistoryQuery(this.repository);
    this.details = dependencies.details || new TradeDetailsQuery(this.repository, this.timeline);

    this.manualOpen = dependencies.manualOpen || new ManualOpenService({
      repository: this.repository,
      timeline: this.timeline,
      executionService: dependencies.executionService,
    });
    this.manualClose = dependencies.manualClose || new ManualCloseService({
      repository: this.repository,
      timeline: this.timeline,
      executionService: dependencies.executionService,
    });
    this.manualModify = dependencies.manualModify || new ManualModifyService({
      repository: this.repository,
      timeline: this.timeline,
      executionService: dependencies.executionService,
    });
    this.manualIntervention = dependencies.manualIntervention || new ManualInterventionService({
      repository: this.repository,
      timeline: this.timeline,
      executionService: dependencies.executionService,
    });
  }

  async createTrade(payload) {
    const tradeId = payload.tradeId || crypto.randomUUID();
    const created = await this.repository.create({
      tradeId,
      userId: payload.userId,
      brokerAccountId: payload.brokerAccountId,
      signalId: payload.signalId || null,
      providerId: payload.providerId || null,
      symbol: payload.symbol,
      normalizedSymbol: payload.normalizedSymbol || payload.symbol,
      direction: payload.direction,
      entryType: payload.entryType || 'MARKET',
      requestedPrice: payload.requestedPrice ?? null,
      entryPrice: payload.entryPrice ?? null,
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
      status: payload.status || TRADE_STATUSES.SIGNAL_RECEIVED,
      openedBy: payload.openedBy || null,
      metadata: payload.metadata || null,
    });

    await emitTradeCreated(created.trade_id, payload.userId);
    return this.getTradeById(payload.userId, created.trade_id);
  }

  async getTradeById(userId, tradeId) {
    const row = await this.repository.findByIdForUser(tradeId, userId);
    if (!row) {
      throw new TradeNotFoundError();
    }
    return this.serialize(row);
  }

  async getTradeDetails(userId, tradeId, options = {}) {
    return this.details.execute(userId, tradeId, options);
  }

  async updateTrade(userId, tradeId, changes) {
    const row = await this.repository.findByIdForUser(tradeId, userId);
    if (!row) {
      throw new TradeNotFoundError();
    }
    await this.repository.update(row.id, changes);
    const updated = await this.repository.findById(row.id);
    await emitTradeUpdated(row.trade_id, userId, Object.keys(changes));
    return this.serialize(updated);
  }

  async markClosed(userId, tradeId, closeData) {
    const row = await this.repository.findByIdForUser(tradeId, userId);
    if (!row) {
      throw new TradeNotFoundError();
    }
    await this.repository.update(row.id, {
      ...closeData,
      status: TRADE_STATUSES.CLOSED,
      closedAt: closeData.closedAt || new Date(),
    });
    await emitTradeClosed(row.trade_id, userId);
    const updated = await this.repository.findById(row.id);
    return this.serialize(updated);
  }

  async archiveTrade(userId, tradeId) {
    const row = await this.repository.findByIdForUser(tradeId, userId);
    if (!row) {
      throw new TradeNotFoundError();
    }
    await this.repository.update(row.id, { status: TRADE_STATUSES.ARCHIVED });
    await emitTradeArchived(row.trade_id, userId);
    const updated = await this.repository.findById(row.id);
    return this.serialize(updated);
  }

  async listTrades(userId, filters = {}, pagination = {}) {
    const result = await this.repository.listTrades({ ...filters, userId }, pagination);
    return {
      trades: result.trades.map((t) => this.serialize(t)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async listOpenPositions(userId, filters, pagination) {
    return this.openPositions.execute(userId, filters, pagination);
  }

  async listPendingOrders(userId, filters, pagination) {
    return this.pendingOrders.execute(userId, filters, pagination);
  }

  async listClosedTrades(userId, filters, pagination) {
    return this.closedTrades.execute(userId, filters, pagination);
  }

  async getHistory(userId, filters, pagination) {
    return this.history.execute(userId, filters, pagination);
  }

  async getHistorySummary(userId, filters) {
    return this.history.summarize(userId, filters);
  }

  async getStatusCounts(userId, filters) {
    return this.repository.countByStatus(userId, filters);
  }

  async getSymbolBreakdown(userId, filters, limit) {
    return this.repository.countBySymbol(userId, filters, limit);
  }

  async sumRealizedProfit(userId, filters) {
    return this.repository.sumRealizedProfit(userId, filters);
  }

  async openManualTrade(userId, payload) {
    return this.manualOpen.open(userId, payload);
  }

  async closeManualTrade(userId, tradeId, payload) {
    return this.manualClose.close(userId, tradeId, payload);
  }

  async modifyManualTrade(userId, tradeId, modifications) {
    return this.manualModify.modify(userId, tradeId, modifications);
  }

  async intervene(userId, tradeId, action, payload) {
    return this.manualIntervention.intervene(userId, tradeId, action, payload);
  }

  async closeAllTrades(userId, filters) {
    return this.manualIntervention.closeAll(userId, filters);
  }

  async getTimeline(userId, tradeId, filters, pagination) {
    const row = await this.repository.findByIdForUser(tradeId, userId);
    if (!row) {
      throw new TradeNotFoundError();
    }
    return this.timeline.listForTrade(row.id, filters, pagination);
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

export default TradeService;
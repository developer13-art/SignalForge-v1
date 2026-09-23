/**
 * Trade Details Query
 *
 * @module signalforge/server/modules/trades/queries/trade-details
 */

import { TradeRepository } from '../trade.repository.js';
import { TradeNotFoundError } from '../trade.errors.js';
import { TradeTimelineService } from '../timeline/trade-timeline.service.js';

export class TradeDetailsQuery {
  constructor(repository = null, timelineService = null) {
    this.repository = repository || new TradeRepository();
    this.timeline = timelineService || new TradeTimelineService();
  }

  async execute(userId, tradeId, options = {}) {
    const row = await this.repository.findByIdForUser(tradeId, userId);
    if (!row) {
      throw new TradeNotFoundError();
    }

    let timeline = null;
    if (options.includeTimeline) {
      timeline = await this.timeline.listForTrade(row.id, options.timelineFilters, options.timelinePagination);
    }

    return {
      trade: this.serialize(row),
      timeline,
    };
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

export default TradeDetailsQuery;
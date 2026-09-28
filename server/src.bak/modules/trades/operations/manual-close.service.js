/**
 * Manual Close Service
 *
 * @module signalforge/server/modules/trades/operations/manual-close
 */

import { TradeRepository } from '../trade.repository.js';
import { TradeTimelineService } from '../timeline/trade-timeline.service.js';
import {
  emitManualClose,
  emitTradeClosed,
} from '../trade.events.js';
import {
  TradeNotFoundError,
  TradeAlreadyClosedError,
} from '../trade.errors.js';
import { isClosedStatus } from '../trade.constants.js';
import { TRADE_STATUSES, TRADE_ACTORS } from '../trade.constants.js';

export class ManualCloseService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradeRepository();
    this.timeline = dependencies.timeline || new TradeTimelineService();
    this.executionService = dependencies.executionService || null;
  }

  async close(userId, tradeId, payload = {}) {
    const trade = await this.repository.findByIdForUser(tradeId, userId);
    if (!trade) {
      throw new TradeNotFoundError();
    }
    if (isClosedStatus(trade.status)) {
      throw new TradeAlreadyClosedError();
    }

    const percentage = payload.percentage ?? 100;
    const isPartial = percentage < 100;

    let executionResult = null;

    if (this.executionService) {
      try {
        if (isPartial) {
          executionResult = await this.executionService.partialClose(
            {
              id: trade.id,
              broker_position_id: trade.broker_position_id,
              broker_ticket: trade.broker_ticket,
              metaapi_account_id: trade.metaapi_account_id,
              volume: trade.volume,
              remaining_volume: trade.remaining_volume,
            },
            percentage,
          );
        } else {
          executionResult = await this.executionService.closePosition({
            id: trade.id,
            broker_position_id: trade.broker_position_id,
            broker_ticket: trade.broker_ticket,
            metaapi_account_id: trade.metaapi_account_id,
          });
        }
      } catch (error) {
        throw error;
      }
    }

    const newRemaining = isPartial
      ? Math.max(0, Number(trade.remaining_volume || trade.volume) * (1 - percentage / 100))
      : 0;

    const finalStatus = isPartial ? TRADE_STATUSES.PARTIAL_CLOSE : TRADE_STATUSES.CLOSED;

    await this.repository.update(trade.id, {
      status: finalStatus,
      remainingVolume: newRemaining,
      exitPrice: payload.exitPrice ?? executionResult?.exitPrice ?? trade.exit_price,
      realizedProfit: payload.realizedProfit ?? trade.realized_profit,
      closedAt: isPartial ? trade.closed_at : new Date(),
      closedBy: TRADE_ACTORS.USER,
    });

    await this.timeline.record({
      tradeId: trade.trade_id,
      userId,
      eventType: isPartial ? 'PARTIAL_CLOSE' : 'MANUAL_CLOSE',
      actor: TRADE_ACTORS.USER,
      actorId: userId,
      previousState: trade.status,
      newState: finalStatus,
      payload: {
        percentage,
        exitPrice: payload.exitPrice ?? null,
        reason: payload.reason || null,
      },
    });

    await emitManualClose(trade.trade_id, userId, { percentage });
    if (!isPartial) {
      await emitTradeClosed(trade.trade_id, userId);
    }

    const updated = await this.repository.findById(trade.id);
    return { trade: updated, partial: isPartial, percentage };
  }
}

export default ManualCloseService;
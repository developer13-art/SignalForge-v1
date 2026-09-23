/**
 * Manual Modify Service
 *
 * @module signalforge/server/modules/trades/operations/manual-modify
 */

import { TradeRepository } from '../trade.repository.js';
import { TradeTimelineService } from '../timeline/trade-timeline.service.js';
import { emitManualModify } from '../trade.events.js';
import { TradeNotFoundError, TradeNotActiveError } from '../trade.errors.js';
import { isActiveStatus } from '../trade.constants.js';
import { TRADE_ACTORS } from '../trade.constants.js';

export class ManualModifyService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradeRepository();
    this.timeline = dependencies.timeline || new TradeTimelineService();
    this.executionService = dependencies.executionService || null;
  }

  async modify(userId, tradeId, modifications) {
    const trade = await this.repository.findByIdForUser(tradeId, userId);
    if (!trade) {
      throw new TradeNotFoundError();
    }
    if (!isActiveStatus(trade.status)) {
      throw new TradeNotActiveError(undefined, { status: trade.status });
    }

    if (this.executionService) {
      try {
        await this.executionService.modifyPosition(
          {
            id: trade.id,
            broker_position_id: trade.broker_position_id,
            broker_ticket: trade.broker_ticket,
            metaapi_account_id: trade.metaapi_account_id,
          },
          modifications,
        );
      } catch (error) {
        throw error;
      }
    }

    await this.repository.update(trade.id, {
      stopLoss: modifications.stopLoss !== undefined ? modifications.stopLoss : trade.stop_loss,
      takeProfit: modifications.takeProfit !== undefined ? modifications.takeProfit : trade.take_profit,
    });

    await this.timeline.record({
      tradeId: trade.trade_id,
      userId,
      eventType: 'MANUAL_MODIFY',
      actor: TRADE_ACTORS.USER,
      actorId: userId,
      previousState: trade.status,
      newState: trade.status,
      payload: modifications,
    });

    await emitManualModify(trade.trade_id, userId, modifications);

    const updated = await this.repository.findById(trade.id);
    return { trade: updated };
  }
}

export default ManualModifyService;
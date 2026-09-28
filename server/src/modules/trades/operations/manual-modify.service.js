/**
 * Manual Modify Service
 *
 * @module signalforge/server/modules/trades/operations/manual-modify
 */
const { TradeRepository } = require('../trade.repository.js');
const { TradeTimelineService } = require('../timeline/trade-timeline.service.js');
const { emitManualModify } = require('../trade.events.js');
const { TradeNotFoundError, TradeNotActiveError } = require('../trade.errors.js');
const { isActiveStatus } = require('../trade.constants.js');
const { TRADE_ACTORS } = require('../trade.constants.js');
class ManualModifyService {
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
module.exports = ManualModifyService;
module.exports.ManualModifyService = ManualModifyService;

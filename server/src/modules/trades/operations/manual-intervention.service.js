/**
 * Manual Intervention Service
 *
 * @module signalforge/server/modules/trades/operations/manual-intervention
 */
const { getLogger } = require('../../../bootstrap/initLogger.js');
const { TradeRepository } = require('../trade.repository.js');
const { TradeTimelineService } = require('../timeline/trade-timeline.service.js');
const { ManualCloseService } = require('./manual-close.service.js');
const { ManualModifyService } = require('./manual-modify.service.js');
const { emitManualIntervention } = require('../trade.events.js');
const { TradeNotFoundError } = require('../trade.errors.js');
const { TRADE_ACTORS } = require('../trade.constants.js');
const { emitTradeClosed, emitTradeUpdated } = require('../trade.events.js');
class ManualInterventionService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new TradeRepository();
    this.timeline = dependencies.timeline || new TradeTimelineService();
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
    this.logger = getLogger('trades-manual-intervention');
  }

  async intervene(userId, tradeId, action, payload = {}) {
    const trade = await this.repository.findByIdForUser(tradeId, userId);
    if (!trade) {
      throw new TradeNotFoundError();
    }

    let result;
    switch (action) {
      case 'CLOSE':
        result = await this.manualClose.close(userId, tradeId, payload);
        break;
      case 'MODIFY':
        result = await this.manualModify.modify(userId, tradeId, payload);
        break;
      case 'ARCHIVE':
        await this.repository.update(trade.id, { status: 'ARCHIVED' });
        await this.timeline.record({
          tradeId: trade.trade_id,
          userId,
          eventType: 'ARCHIVED',
          actor: TRADE_ACTORS.USER,
          actorId: userId,
          previousState: trade.status,
          newState: 'ARCHIVED',
        });
        result = { archived: true };
        break;
      default:
        throw new Error(`Unsupported manual action: ${action}`);
    }

    await emitManualIntervention(trade.trade_id, userId, action, { payload });
    return { action, result };
  }

  async closeAll(userId, filters = {}) {
    const openTrades = await this.repository.listOpenPositions(userId, filters, {
      limit: 100,
      offset: 0,
    });

    const results = { closed: 0, failed: 0, errors: [] };

    for (const trade of openTrades.trades) {
      try {
        await this.manualClose.close(userId, trade.id, { percentage: 100 });
        results.closed++;
      } catch (error) {
        results.failed++;
        results.errors.push({ tradeId: trade.id, error: error.message });
        this.logger.warn({ err: error, tradeId: trade.id }, 'Failed to close trade');
      }
    }

    return results;
  }
}

module.exports = ManualInterventionService;
module.exports.ManualInterventionService = ManualInterventionService;

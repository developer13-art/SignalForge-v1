/**
 * Manual Intervention Service
 *
 * @module signalforge/server/modules/trades/operations/manual-intervention
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { TradeRepository } from '../trade.repository.js';
import { TradeTimelineService } from '../timeline/trade-timeline.service.js';
import { ManualCloseService } from './manual-close.service.js';
import { ManualModifyService } from './manual-modify.service.js';
import { emitManualIntervention } from '../trade.events.js';
import { TradeNotFoundError } from '../trade.errors.js';
import { TRADE_ACTORS } from '../trade.constants.js';
import {
  emitTradeClosed,
  emitTradeUpdated,
} from '../trade.events.js';

export class ManualInterventionService {
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

export { emitTradeClosed, emitTradeUpdated };

export default ManualInterventionService;
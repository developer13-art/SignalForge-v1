/**
 * Period Closer Service
 *
 * @module signalforge/server/modules/performance/periods/closer
 */

import { PeriodRepository } from './repository.js';
import { PeriodFreezeService } from './freeze.js';
import { PERFORMANCE_METRIC_TYPES } from '../performance.constants.js';
import {
  PeriodAlreadyClosedError,
  PerformancePeriodNotFoundError,
} from '../performance.errors.js';
import {
  emitPeriodClosed,
  emitMetricCalculated,
} from '../performance.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class PeriodCloserService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new PeriodRepository();
    this.freeze = dependencies.freeze || new PeriodFreezeService();
    this.performanceRepository =
      dependencies.performanceRepository ||
      this.repository.performanceRepository;
    this.logger = getLogger('performance-closer');
  }

  async close(periodId, options = {}) {
    const period = await this.repository.findById(periodId);
    if (!period) {
      throw new PerformancePeriodNotFoundError();
    }
    if (period.status === 'CLOSED') {
      throw new PeriodAlreadyClosedError();
    }

    let calculation = {
      grossProfit: period.gross_profit,
      grossLoss: period.gross_loss,
      tradingCosts: period.trading_costs,
      eligibleNetProfit: period.eligible_net_profit,
      tradeCount: period.trade_count,
      winCount: period.win_count,
      lossCount: period.loss_count,
    };

    if (period.status !== 'FROZEN') {
      const freezeResult = await this.freeze.freeze(period.id);
      calculation = freezeResult.calculation;
    }

    await this.repository.update(period.id, {
      status: 'CLOSED',
      closedAt: new Date(),
      closingBalance: options.closingBalance ?? period.closing_balance,
    });

    await emitMetricCalculated(
      period.user_id,
      period.id,
      PERFORMANCE_METRIC_TYPES.ELIGIBLE_NET_PROFIT,
      calculation.eligibleNetProfit,
    );

    await emitPeriodClosed(period.user_id, period.id, {
      settlementPeriod: period.settlement_period,
      eligibleNetProfit: calculation.eligibleNetProfit,
      tradeCount: calculation.tradeCount,
    });

    const updated = await this.repository.findById(period.id);
    return { closed: true, period: updated };
  }

  async closeDuePeriods(graceHours) {
    const periods = await this.repository.findToClose(null, graceHours);
    const results = { closed: 0, failed: 0, errors: [] };

    for (const period of periods) {
      try {
        await this.close(period.id);
        results.closed++;
      } catch (error) {
        results.failed++;
        results.errors.push({ periodId: period.id, error: error.message });
        this.logger.error({ err: error, periodId: period.id }, 'Failed to close period');
      }
    }

    return results;
  }
}

export default PeriodCloserService;
/**
 * Period Freeze Service
 *
 * @module signalforge/server/modules/performance/periods/freeze
 */

import { PeriodRepository } from './repository.js';
import { PeriodCalculatorService } from './calculator.js';
import { PeriodStatuses } from '../performance.constants.js';
import {
  PeriodAlreadyClosedError,
  PeriodNotEditableError,
  PerformancePeriodNotFoundError,
} from '../performance.errors.js';
import {
  emitPeriodFrozen,
  emitMetricCalculated,
} from '../performance.events.js';
import { PERFORMANCE_METRIC_TYPES } from '../performance.constants.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class PeriodFreezeService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new PeriodRepository();
    this.calculator = dependencies.calculator || new PeriodCalculatorService();
    this.performanceRepository =
      dependencies.performanceRepository ||
      this.repository.performanceRepository;
    this.logger = getLogger('performance-freeze');
  }

  async freeze(periodId) {
    const period = await this.repository.findById(periodId);
    if (!period) {
      throw new PerformancePeriodNotFoundError();
    }

    if (period.status === 'CLOSED') {
      throw new PeriodAlreadyClosedError();
    }

    if (period.status !== 'OPEN') {
      return { frozen: false, reason: 'NOT_OPEN', status: period.status };
    }

    const calculation = await this.calculator.calculateForPeriod(period.id);

    await this.repository.update(period.id, {
      status: 'FROZEN',
      grossProfit: calculation.grossProfit,
      grossLoss: calculation.grossLoss,
      tradingCosts: calculation.tradingCosts,
      eligibleNetProfit: calculation.eligibleNetProfit,
      tradeCount: calculation.tradeCount,
      winCount: calculation.winCount,
      lossCount: calculation.lossCount,
      frozenAt: new Date(),
    });

    await this.performanceRepository.createMetric({
      periodId: period.id,
      userId: period.user_id,
      metricType: PERFORMANCE_METRIC_TYPES.GROSS_PROFIT,
      value: calculation.grossProfit,
      breakdown: calculation.breakdown.grossProfit,
    });

    await this.performanceRepository.createMetric({
      periodId: period.id,
      userId: period.user_id,
      metricType: PERFORMANCE_METRIC_TYPES.GROSS_LOSS,
      value: calculation.grossLoss,
      breakdown: calculation.breakdown.grossLoss,
    });

    await this.performanceRepository.createMetric({
      periodId: period.id,
      userId: period.user_id,
      metricType: PERFORMANCE_METRIC_TYPES.TRADING_COSTS,
      value: calculation.tradingCosts,
      breakdown: calculation.breakdown.tradingCosts,
    });

    await this.performanceRepository.createMetric({
      periodId: period.id,
      userId: period.user_id,
      metricType: PERFORMANCE_METRIC_TYPES.ELIGIBLE_NET_PROFIT,
      value: calculation.eligibleNetProfit,
      breakdown: calculation.breakdown.eligible,
    });

    await emitMetricCalculated(
      period.user_id,
      period.id,
      PERFORMANCE_METRIC_TYPES.ELIGIBLE_NET_PROFIT,
      calculation.eligibleNetProfit,
    );

    await emitPeriodFrozen(period.user_id, period.id);

    return {
      frozen: true,
      periodId: period.id,
      calculation,
    };
  }

  async freezeDuePeriods() {
    const periods = await this.repository.findToFreeze();
    const results = { frozen: 0, failed: 0, errors: [] };

    for (const period of periods) {
      try {
        await this.freeze(period.id);
        results.frozen++;
      } catch (error) {
        results.failed++;
        results.errors.push({ periodId: period.id, error: error.message });
        this.logger.error({ err: error, periodId: period.id }, 'Failed to freeze period');
      }
    }

    return results;
  }
}

export default PeriodFreezeService;
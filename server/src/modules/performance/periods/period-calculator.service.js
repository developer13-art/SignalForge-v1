/**
 * Period Calculator Service
 *
 * Computes performance metrics for a settlement period from realized
 * trades: gross profit, gross loss, trading costs, and eligible net
 * profit.
 *
 * @module signalforge/server/modules/performance/periods/calculator
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { EligibleNetProfitService } from '../metrics/eligible-net-profit.service.js';
import { GrossProfitService } from '../metrics/gross-profit.service.js';
import { GrossLossService } from '../metrics/gross-loss.service.js';
import { TradingCostsService } from '../metrics/trading-costs.service.js';
import { PeriodCalculationError } from '../performance.errors.js';

export class PeriodCalculatorService {
  constructor(dependencies = {}) {
    this.db = dependencies.db || getDatabase();
    this.grossProfit = dependencies.grossProfit || new GrossProfitService();
    this.grossLoss = dependencies.grossLoss || new GrossLossService();
    this.tradingCosts = dependencies.tradingCosts || new TradingCostsService();
    this.eligibleNetProfit = dependencies.eligibleNetProfit || new EligibleNetProfitService();
  }

  async calculateForPeriod(periodId) {
    const periodResult = await this.db.query(
      `SELECT id, user_id, broker_account_id, settlement_period, started_at, ends_at
         FROM performance_periods
        WHERE id = $1
        LIMIT 1`,
      [periodId],
    );
    const period = periodResult.rows[0];
    if (!period) {
      throw new PeriodCalculationError('Performance period not found', { periodId });
    }

    if (!period.started_at || !period.ends_at) {
      throw new PeriodCalculationError('Period start and end must be set', { periodId });
    }

    const tradesResult = await this.db.query(
      `SELECT id, user_id, broker_account_id, symbol, direction, volume,
              entry_price, exit_price, realized_profit, commission, swap,
              opened_at, closed_at
         FROM trades
        WHERE user_id = $1
          AND (broker_account_id IS NOT DISTINCT FROM $2)
          AND status IN ('CLOSED', 'ARCHIVED')
          AND closed_at >= $3
          AND closed_at <= $4`,
      [
        period.user_id,
        period.broker_account_id,
        period.started_at,
        period.ends_at,
      ],
    );

    const trades = tradesResult.rows;

    const grossProfit = this.grossProfit.calculate(trades);
    const grossLoss = this.grossLoss.calculate(trades);
    const tradingCosts = this.tradingCosts.calculate(trades);

    const eligible = this.eligibleNetProfit.calculate({
      grossProfit: grossProfit.total,
      grossLoss: grossLoss.total,
      tradingCosts: tradingCosts.total,
    });

    const wins = trades.filter((t) => Number(t.realized_profit || 0) > 0).length;
    const losses = trades.filter((t) => Number(t.realized_profit || 0) < 0).length;

    return {
      periodId: period.id,
      settlementPeriod: period.settlement_period,
      tradeCount: trades.length,
      winCount: wins,
      lossCount: losses,
      grossProfit: grossProfit.total,
      grossLoss: grossLoss.total,
      tradingCosts: tradingCosts.total,
      eligibleNetProfit: eligible.net,
      breakdown: {
        grossProfit,
        grossLoss,
        tradingCosts,
        eligible,
      },
    };
  }
}

export default PeriodCalculatorService;
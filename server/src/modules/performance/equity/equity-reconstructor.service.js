/**
 * Equity Reconstructor Service
 *
 * Reconstructs an equity curve for a period from trade closes and
 * equity snapshots, producing a canonical series usable by
 * analytics and reporting.
 *
 * @module signalforge/server/modules/performance/equity/reconstructor
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { EquityReconstructionError } from '../performance.errors.js';
import { emitEquityReconstructed } from '../performance.events.js';

export class EquityReconstructorService {
  constructor(database = null) {
    this.db = database || getDatabase();
  }

  async reconstructForPeriod(userId, periodId) {
    const periodResult = await this.db.query(
      `SELECT id, user_id, broker_account_id, settlement_period, started_at, ends_at,
              opening_balance, closing_balance
         FROM performance_periods
        WHERE id = $1 AND user_id = $2
        LIMIT 1`,
      [periodId, userId],
    );

    const period = periodResult.rows[0];
    if (!period) {
      throw new EquityReconstructionError('Performance period not found', {
        periodId,
        userId,
      });
    }

    const tradesResult = await this.db.query(
      `SELECT id, symbol, realized_profit, commission, swap, closed_at
         FROM trades
        WHERE user_id = $1
          AND (broker_account_id IS NOT DISTINCT FROM $2)
          AND status IN ('CLOSED', 'ARCHIVED')
          AND closed_at >= $3
          AND closed_at <= $4
        ORDER BY closed_at ASC`,
      [
        period.user_id,
        period.broker_account_id,
        period.started_at,
        period.ends_at,
      ],
    );

    const trades = tradesResult.rows;

    const snapshotsResult = await this.db.query(
      `SELECT id, balance, equity, captured_at
         FROM equity_snapshots
        WHERE user_id = $1
          AND (broker_account_id IS NOT DISTINCT FROM $2)
          AND captured_at >= $3
          AND captured_at <= $4
        ORDER BY captured_at ASC`,
      [
        period.user_id,
        period.broker_account_id,
        period.started_at,
        period.ends_at,
      ],
    );

    const snapshots = snapshotsResult.rows;

    const startEquity = Number(period.opening_balance || 0);
    let running = startEquity;
    const points = [];

    for (const trade of trades) {
      const profit = Number(trade.realized_profit || 0);
      const commission = Number(trade.commission || 0);
      const swap = Number(trade.swap || 0);
      running += profit - commission - swap;

      points.push({
        timestamp: trade.closed_at,
        equity: Number(running.toFixed(2)),
        tradeId: trade.id,
        symbol: trade.symbol,
        delta: Number((profit - commission - swap).toFixed(2)),
        source: 'TRADE_CLOSE',
      });
    }

    for (const snapshot of snapshots) {
      points.push({
        timestamp: snapshot.captured_at,
        equity: snapshot.equity !== null ? Number(snapshot.equity) : null,
        balance: snapshot.balance !== null ? Number(snapshot.balance) : null,
        source: 'SNAPSHOT',
        snapshotId: snapshot.id,
      });
    }

    points.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    const endEquity = running;
    const totalReturn = endEquity - startEquity;
    const totalReturnPercent =
      startEquity > 0 ? (totalReturn / startEquity) * 100 : null;

    await emitEquityReconstructed(userId, period.id, points.length, {
      settlementPeriod: period.settlement_period,
    });

    return {
      periodId: period.id,
      settlementPeriod: period.settlement_period,
      startEquity: Number(startEquity.toFixed(2)),
      endEquity: Number(endEquity.toFixed(2)),
      totalReturn: Number(totalReturn.toFixed(2)),
      totalReturnPercent:
        totalReturnPercent !== null ? Number(totalReturnPercent.toFixed(2)) : null,
      points,
      tradeCount: trades.length,
      snapshotCount: snapshots.length,
    };
  }
}

export default EquityReconstructorService;
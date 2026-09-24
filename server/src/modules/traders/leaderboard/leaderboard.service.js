/**
 * Leaderboard Service
 *
 * @module signalforge/server/modules/traders/leaderboard/service
 */

import { LeaderboardRepository } from './repository.js';
import {
  LEADERBOARD_METRICS,
  LEADERBOARD_PERIODS,
  DEFAULT_LEADERBOARD_LIMIT,
  MAX_LEADERBOARD_LIMIT,
} from '../trader.constants.js';
import { LeaderboardError } from '../trader.errors.js';
import { emitLeaderboardRefreshed } from '../trader.events.js';

export class LeaderboardService {
  constructor(repository = null) {
    this.repository = repository || new LeaderboardRepository();
  }

  async getLeaderboard(metric = LEADERBOARD_METRICS.PROFIT, period = LEADERBOARD_PERIODS.MONTHLY, limit = null) {
    const resolvedMetric = metric || LEADERBOARD_METRICS.PROFIT;
    const resolvedPeriod = period || LEADERBOARD_PERIODS.MONTHLY;
    const resolvedLimit = Math.min(
      Math.max(Number(limit) || DEFAULT_LEADERBOARD_LIMIT, 1),
      MAX_LEADERBOARD_LIMIT,
    );

    try {
      const rows = await this.repository.getLeaderboard(
        resolvedMetric,
        resolvedPeriod,
        resolvedLimit,
      );

      const ranked = rows.map((row, index) => ({
        rank: index + 1,
        traderId: row.id,
        userId: row.user_id,
        displayName: row.display_name,
        slug: row.slug,
        avatarUrl: row.avatar_url,
        followerCount: row.follower_count,
        winRate: row.win_rate,
        averageRr: row.average_rr,
        profitFactor: row.profit_factor,
        sharpeRatio: row.sharpe_ratio,
        maxDrawdownPercent: row.max_drawdown_percent,
        consistencyScore: row.consistency_score,
        reputationScore: row.reputation_score,
        tradingStyle: row.trading_style,
        riskStyle: row.risk_style,
      }));

      await emitLeaderboardRefreshed(resolvedMetric, resolvedPeriod, ranked.length);

      return {
        metric: resolvedMetric,
        period: resolvedPeriod,
        limit: resolvedLimit,
        entries: ranked,
      };
    } catch (error) {
      throw new LeaderboardError(error.message, {
        metric: resolvedMetric,
        period: resolvedPeriod,
      });
    }
  }

  async getTopTradersByMetric(metric, limit = 20) {
    return this.getLeaderboard(metric, LEADERBOARD_PERIODS.ALL_TIME, limit);
  }

  async getConsistencyLeaders(limit = 20) {
    return this.getLeaderboard(
      LEADERBOARD_METRICS.CONSISTENCY,
      LEADERBOARD_PERIODS.ALL_TIME,
      limit,
    );
  }
}

export default LeaderboardService;
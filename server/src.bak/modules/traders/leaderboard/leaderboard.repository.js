/**
 * Leaderboard Repository
 *
 * @module signalforge/server/modules/traders/leaderboard/repository
 */

import { TraderRepository } from '../trader.repository.js';

export class LeaderboardRepository {
  constructor(db = null) {
    this.traderRepository = new TraderRepository(db);
  }

  async getLeaderboard(metric, period, limit) {
    return this.traderRepository.getLeaderboard(metric, period, limit);
  }
}

export default LeaderboardRepository;
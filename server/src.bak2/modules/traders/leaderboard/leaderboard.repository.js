/**
 * Leaderboard Repository
 *
 * @module signalforge/server/modules/traders/leaderboard/repository
 */
const { TraderRepository } = require('../trader.repository.js');

export class LeaderboardRepository {
  constructor(db = null) {
    this.traderRepository = new TraderRepository(db);
  }

  async getLeaderboard(metric, period, limit) {
    return this.traderRepository.getLeaderboard(metric, period, limit);
  }
}
module.exports = LeaderboardRepository;
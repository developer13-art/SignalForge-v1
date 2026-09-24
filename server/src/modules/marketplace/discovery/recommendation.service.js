/**
 * Recommendation Service
 *
 * @module signalforge/server/modules/marketplace/discovery/recommendation
 */

import { getDatabase } from '../../../bootstrap/initDatabase.js';
import { ListingRepository } from '../listings/repository.js';
import { RankingService } from './ranking.js';
import {
  RECOMMENDATION_STRATEGIES,
} from '../marketplace.constants.js';
import { emitRecommendationGenerated } from '../marketplace.events.js';

export class RecommendationService {
  constructor(database = null, repository = null, ranking = null) {
    this.db = database || getDatabase();
    this.repository = repository || new ListingRepository();
    this.ranking = ranking || new RankingService();
  }

  async getRecommendations(userId, limit = 10, strategy = RECOMMENDATION_STRATEGIES.HYBRID) {
    const publicListings = await this.repository.list(
      { status: 'PUBLISHED', visibility: 'PUBLIC' },
      { limit: 100, offset: 0 },
    );

    if (strategy === RECOMMENDATION_STRATEGIES.POPULARITY) {
      return this.fromPopularity(publicListings.listings, limit);
    }

    if (!userId) {
      return this.fromPopularity(publicListings.listings, limit);
    }

    const historyResult = await this.db.query(
      `SELECT DISTINCT s.provider_id
         FROM copy_trading_subscriptions s
        WHERE s.subscriber_id = $1
          AND s.status IN ('ACTIVE', 'PAUSED')`,
      [userId],
    );
    const followedProviders = new Set(
      historyResult.rows.map((row) => row.provider_id),
    );

    const candidates = publicListings.listings.filter(
      (l) => !followedProviders.has(l.provider_id),
    );

    const ranked = this.ranking.rank(candidates);
    const result = ranked.slice(0, limit);

    await emitRecommendationGenerated(
      userId,
      result.map((r) => r.id),
      strategy,
    );

    return result;
  }

  fromPopularity(listings, limit) {
    return this.ranking.rank(listings).slice(0, limit);
  }
}

export default RecommendationService;
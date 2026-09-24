/**
 * Featured Service
 *
 * @module signalforge/server/modules/marketplace/discovery/featured
 */

import { ListingRepository } from '../listings/repository.js';
import { RankingService } from './ranking.js';

export class FeaturedService {
  constructor(repository = null, ranking = null) {
    this.repository = repository || new ListingRepository();
    this.ranking = ranking || new RankingService();
  }

  async getFeatured(limit = 20) {
    const rows = await this.repository.listFeatured(limit);
    return this.ranking.rank(rows);
  }

  async getTrending(limit = 20) {
    const result = await this.repository.list(
      {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
      { limit: 100, offset: 0 },
    );

    const ranked = this.ranking.rank(result.listings);
    return ranked.slice(0, limit);
  }
}

export default FeaturedService;
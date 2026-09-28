/**
 * Search Service
 *
 * @module signalforge/server/modules/marketplace/discovery/search
 */
const { ListingRepository } = require('../listings/repository.js');
const { RankingService } = require('./ranking.js');
const { LISTING_STATUSES, LISTING_VISIBILITY, RANKING_STRATEGIES, DEFAULT_SEARCH_LIMIT } = require('../marketplace.constants.js');
const { emitSearchPerformed } = require('../marketplace.events.js');
class SearchService {
  constructor(repository = null, ranking = null) {
    this.repository = repository || new ListingRepository();
    this.ranking = ranking || new RankingService();
  }

  async search(filters = {}, userId = null) {
    const limit = Math.min(
      Math.max(Number(filters.limit) || DEFAULT_SEARCH_LIMIT, 1),
      200,
    );

    const result = await this.repository.list(
      {
        status: LISTING_STATUSES.PUBLISHED,
        visibility: LISTING_VISIBILITY.PUBLIC,
        search: filters.search,
        categories: filters.categories,
        tags: filters.tags,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
        featured: filters.featured,
      },
      { limit, offset: filters.offset || 0 },
    );

    const ranked = this.ranking.rank(result.listings, filters.rankingStrategy);

    await emitSearchPerformed(userId, filters, ranked.length);

    return {
      listings: ranked,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      strategy: filters.rankingStrategy || RANKING_STRATEGIES.BALANCED,
    };
  }
}
module.exports = SearchService;
module.exports.SearchService = SearchService;

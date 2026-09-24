/**
 * Ranking Service
 *
 * @module signalforge/server/modules/marketplace/discovery/ranking
 */

import { RANKING_STRATEGIES } from '../marketplace.constants.js';

const WEIGHTS = Object.freeze({
  reputation: 0.35,
  subscribers: 0.2,
  winRate: 0.2,
  averageRr: 0.15,
  consistency: 0.05,
  recency: 0.05,
});

export class RankingService {
  scoreListing(listing, strategy = RANKING_STRATEGIES.BALANCED) {
    const reputation = Number(listing.rating_average || 0) / 5;
    const subscribers = Math.min(1, Number(listing.subscriber_count || 0) / 1000);
    const winRate = Math.min(1, Number(listing.win_rate || 0) / 100);
    const averageRr = Math.min(1, Number(listing.average_rr || 0) / 3);
    const consistency = Math.min(1, Number(listing.consistency_score || 0));
    const ageDays = listing.published_at
      ? (Date.now() - new Date(listing.published_at).getTime()) / (24 * 60 * 60 * 1000)
      : 365;
    const recency = Math.max(0, 1 - ageDays / 365);

    if (strategy === RANKING_STRATEGIES.REPUTATION) {
      return Number(reputation.toFixed(4));
    }
    if (strategy === RANKING_STRATEGIES.SUBSCRIBERS) {
      return Number(subscribers.toFixed(4));
    }
    if (strategy === RANKING_STRATEGIES.WIN_RATE) {
      return Number(winRate.toFixed(4));
    }
    if (strategy === RANKING_STRATEGIES.AVERAGE_RR) {
      return Number(averageRr.toFixed(4));
    }
    if (strategy === RANKING_STRATEGIES.CONSISTENCY) {
      return Number(consistency.toFixed(4));
    }
    if (strategy === RANKING_STRATEGIES.RECENCY) {
      return Number(recency.toFixed(4));
    }

    const score =
      reputation * WEIGHTS.reputation +
      subscribers * WEIGHTS.subscribers +
      winRate * WEIGHTS.winRate +
      averageRr * WEIGHTS.averageRr +
      consistency * WEIGHTS.consistency +
      recency * WEIGHTS.recency;

    return Number(Math.max(0, Math.min(1, score)).toFixed(4));
  }

  rank(listings, strategy = RANKING_STRATEGIES.BALANCED) {
    if (!Array.isArray(listings)) {
      return [];
    }
    return listings
      .map((listing) => ({
        listing,
        score: this.scoreListing(listing, strategy),
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => ({
        ...entry.listing,
        _rankingScore: entry.score,
      }));
  }
}

export default RankingService;
/**
 * Provider Matcher
 *
 * @module signalforge/server/modules/trade-matching/matchers/provider
 */

export class ProviderMatcher {
  scoreTrade(trade, providerId) {
    if (!trade || !providerId) {
      return 0;
    }
    if (String(trade.provider_id) === String(providerId)) {
      return 1;
    }
    return 0;
  }

  scoreTrades(trades, providerId) {
    if (!Array.isArray(trades)) {
      return [];
    }
    return trades.map((trade) => {
      const score = this.scoreTrade(trade, providerId);
      return { trade, score, factors: { provider: score } };
    });
  }
}

export default ProviderMatcher;
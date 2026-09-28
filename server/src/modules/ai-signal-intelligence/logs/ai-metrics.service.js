/**
 * AI Metrics Service
 *
 * Aggregates metrics for observability: request counts, average
 * latency, cost, and confidence distribution.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/logs/metrics
 */
const { AiLogRepository } = require('./ai-log.repository.js');
class AiMetricsService {
  constructor(repository = null) {
    this.repository = repository || new AiLogRepository();
  }

  async summarize(filters = {}) {
    const cost = await this.repository.sumCost(filters);
    return {
      cost: {
        totalUsd: cost.totalCostUsd,
        requests: cost.requests,
        tokens: cost.totalTokens,
      },
      period: {
        since: filters.since || null,
        until: filters.until || null,
      },
    };
  }
}
module.exports = AiMetricsService;
module.exports.AiMetricsService = AiMetricsService;

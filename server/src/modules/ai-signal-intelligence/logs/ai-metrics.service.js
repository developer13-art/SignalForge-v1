/**
 * AI Metrics Service
 *
 * Aggregates metrics for observability: request counts, average
 * latency, cost, and confidence distribution.
 *
 * @module signalforge/server/modules/ai-signal-intelligence/logs/metrics
 */

import { AiLogRepository } from './ai-log.repository.js';

export class AiMetricsService {
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

export default AiMetricsService;
/**
 * Execution Latency Service
 *
 * @module signalforge/server/modules/analytics/metrics/execution-latency
 */

export class ExecutionLatencyService {
  constructor(repository = null) {
    this.repository = repository;
  }

  async calculate(userId, filters = {}) {
    if (!this.repository) {
      return {
        averageMs: null,
        minMs: null,
        maxMs: null,
        p95Ms: null,
        count: 0,
      };
    }
    return this.repository.aggregateLatency(userId, filters);
  }

  classify(latencyMs) {
    if (latencyMs === null || latencyMs === undefined) {
      return 'UNKNOWN';
    }
    if (latencyMs <= 200) {
      return 'EXCELLENT';
    }
    if (latencyMs <= 500) {
      return 'GOOD';
    }
    if (latencyMs <= 1000) {
      return 'ACCEPTABLE';
    }
    if (latencyMs <= 2000) {
      return 'SLOW';
    }
    return 'CRITICAL';
  }
}

export default ExecutionLatencyService;
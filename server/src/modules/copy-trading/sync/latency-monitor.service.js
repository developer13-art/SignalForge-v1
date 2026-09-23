/**
 * Latency Monitor Service
 *
 * @module signalforge/server/modules/copy-trading/sync/latency-monitor
 */

import { getLogger } from '../../../bootstrap/initLogger.js';
import { emitLatencyAlert } from '../copy-trading.events.js';
import { DEFAULT_LATENCY_ALERT_MS } from '../copy-trading.constants.js';

export class LatencyMonitorService {
  constructor(options = {}) {
    this.defaultThreshold = options.threshold || DEFAULT_LATENCY_ALERT_MS;
    this.logger = getLogger('copy-trading-latency');
    this.records = [];
  }

  record(subscriberId, latencyMs, threshold = null) {
    const limit = threshold || this.defaultThreshold;
    this.records.push({
      subscriberId,
      latencyMs,
      threshold: limit,
      timestamp: Date.now(),
    });

    if (this.records.length > 10000) {
      this.records.shift();
    }

    if (latencyMs > limit) {
      this.logger.warn({ subscriberId, latencyMs, threshold: limit }, 'Latency alert');
      return emitLatencyAlert(subscriberId, latencyMs, limit);
    }

    return null;
  }

  summarize() {
    if (this.records.length === 0) {
      return { count: 0, averageMs: 0, maxMs: 0, minMs: 0 };
    }
    const values = this.records.map((r) => r.latencyMs);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: values.length,
      averageMs: Number((sum / values.length).toFixed(2)),
      maxMs: Math.max(...values),
      minMs: Math.min(...values),
    };
  }

  reset() {
    this.records = [];
  }
}

export default LatencyMonitorService;
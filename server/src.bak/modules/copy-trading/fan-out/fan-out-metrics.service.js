/**
 * Fan-Out Metrics Service
 *
 * @module signalforge/server/modules/copy-trading/fan-out/metrics
 */

export class FanOutMetricsService {
  constructor() {
    this.metrics = {
      totalSignals: 0,
      totalBatches: 0,
      totalSubscribers: 0,
      totalSucceeded: 0,
      totalFailed: 0,
      totalDurationMs: 0,
    };
  }

  startSignal(signalId) {
    this.metrics.totalSignals++;
    return {
      signalId,
      startedAt: Date.now(),
    };
  }

  finishSignal(signalId, summary) {
    return {
      signalId,
      completedAt: Date.now(),
      summary,
    };
  }

  recordBatch(subscriberCount) {
    this.metrics.totalBatches++;
    this.metrics.totalSubscribers += subscriberCount;
  }

  recordOutcomes(succeeded, failed) {
    this.metrics.totalSucceeded += succeeded;
    this.metrics.totalFailed += failed;
  }

  recordDuration(durationMs) {
    this.metrics.totalDurationMs += durationMs;
  }

  summarize() {
    const averageDuration =
      this.metrics.totalSignals > 0
        ? this.metrics.totalDurationMs / this.metrics.totalSignals
        : 0;
    return {
      ...this.metrics,
      averageDurationMs: Number(averageDuration.toFixed(2)),
    };
  }
}

export default FanOutMetricsService;
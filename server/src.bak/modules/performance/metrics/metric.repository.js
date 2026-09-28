/**
 * Performance Metric Repository
 *
 * @module signalforge/server/modules/performance/metrics/repository
 */

import { PerformanceRepository } from '../performance.repository.js';

export class MetricRepository {
  constructor(db = null) {
    this.performanceRepository = new PerformanceRepository(db);
  }

  async create(data) {
    return this.performanceRepository.createMetric(data);
  }

  async list(periodId) {
    return this.performanceRepository.listMetrics(periodId);
  }
}

export default MetricRepository;
/**
 * Performance Metric Repository
 *
 * @module signalforge/server/modules/performance/metrics/repository
 */
const { PerformanceRepository } = require('../performance.repository.js');

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
module.exports = MetricRepository;
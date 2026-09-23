/**
 * Equity Snapshot Repository
 *
 * @module signalforge/server/modules/performance/equity/repository
 */

import { PerformanceRepository } from '../performance.repository.js';

export class EquitySnapshotRepository {
  constructor(db = null) {
    this.performanceRepository = new PerformanceRepository(db);
  }

  async create(data) {
    return this.performanceRepository.createEquitySnapshot(data);
  }

  async list(userId, filters, pagination) {
    return this.performanceRepository.listEquitySnapshots(userId, filters, pagination);
  }

  async findLatest(userId, brokerAccountId) {
    return this.performanceRepository.findLatestEquitySnapshot(userId, brokerAccountId);
  }

  async deleteForPeriod(periodId) {
    return this.performanceRepository.deleteEquitySnapshotsForPeriod(periodId);
  }
}

export default EquitySnapshotRepository;
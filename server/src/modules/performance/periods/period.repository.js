/**
 * Performance Period Repository
 *
 * @module signalforge/server/modules/performance/periods/repository
 */

import { PerformanceRepository } from '../performance.repository.js';

export class PeriodRepository {
  constructor(db = null) {
    this.performanceRepository = new PerformanceRepository(db);
  }

  async create(data) {
    return this.performanceRepository.createPeriod(data);
  }

  async findById(periodId) {
    return this.performanceRepository.findPeriodById(periodId);
  }

  async findByKey(userId, brokerAccountId, settlementPeriod) {
    return this.performanceRepository.findPeriodByKey(
      userId,
      brokerAccountId,
      settlementPeriod,
    );
  }

  async list(userId, filters, pagination) {
    return this.performanceRepository.listPeriods(userId, filters, pagination);
  }

  async update(periodId, data) {
    return this.performanceRepository.updatePeriod(periodId, data);
  }

  async delete(periodId) {
    return this.performanceRepository.deletePeriod(periodId);
  }

  async findToFreeze(referenceTime) {
    return this.performanceRepository.findPeriodsToFreeze(referenceTime);
  }

  async findToClose(referenceTime, graceHours) {
    return this.performanceRepository.findPeriodsToClose(referenceTime, graceHours);
  }
}

export default PeriodRepository;
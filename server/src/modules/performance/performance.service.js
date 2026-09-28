/**
 * Performance Service (facade)
 *
 * @module signalforge/server/modules/performance/service
 */
const { PerformanceRepository } = require('./performance.repository.js');
const { PeriodService } = require('./periods/period.service.js');
const { PeriodCalculatorService } = require('./periods/period-calculator.service.js');
const { PeriodFreezeService } = require('./periods/period-freeze.service.js');
const { PeriodCloserService } = require('./periods/period-closer.service.js');
const { MetricService } = require('./metrics/metric.service.js');
const { EquitySnapshotService } = require('./equity/equity-snapshot.service.js');
const { EquityReconstructorService } = require('./equity/equity-reconstructor.service.js');
const { PerformancePeriodNotFoundError } = require('./performance.errors.js');
const { DEFAULT_FREEZE_GRACE_HOURS } = require('./performance.constants.js');
class PerformanceService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new PerformanceRepository();

    this.periods =
      dependencies.periods ||
      new PeriodService({
        repository: this.repository,
      });

    this.calculator =
      dependencies.calculator ||
      new PeriodCalculatorService({ db: dependencies.db });

    this.freeze =
      dependencies.freeze ||
      new PeriodFreezeService({
        repository: this.repository,
        calculator: this.calculator,
      });

    this.closer =
      dependencies.closer ||
      new PeriodCloserService({
        repository: this.repository,
        freeze: this.freeze,
      });

    this.metrics =
      dependencies.metrics ||
      new MetricService(dependencies.metricRepository);

    this.equitySnapshots =
      dependencies.equitySnapshots ||
      new EquitySnapshotService(dependencies.equitySnapshotRepository);

    this.equityReconstructor =
      dependencies.equityReconstructor ||
      new EquityReconstructorService(dependencies.db);
  }

  async openPeriod(userId, payload) {
    return this.periods.openPeriod(userId, payload);
  }

  async ensureCurrentPeriod(userId, brokerAccountId, options) {
    return this.periods.ensureCurrentPeriod(userId, brokerAccountId, options);
  }

  async getPeriod(userId, periodId) {
    return this.periods.getPeriodById(userId, periodId);
  }

  async listPeriods(userId, filters, pagination) {
    return this.periods.listPeriods(userId, filters, pagination);
  }

  async updatePeriod(userId, periodId, payload) {
    return this.periods.updatePeriod(userId, periodId, payload);
  }

  async calculatePeriod(userId, periodId) {
    return this.periods.calculatePeriod(userId, periodId);
  }

  async freezePeriod(userId, periodId) {
    return this.periods.freezePeriod(userId, periodId);
  }

  async closePeriod(userId, periodId, options) {
    return this.periods.closePeriod(userId, periodId, options);
  }

  async getMetrics(periodId) {
    return this.periods.getMetrics(periodId);
  }

  async getEligibleNetProfit(periodId) {
    return this.metrics.getEligibleNetProfit(periodId);
  }

  async freezeDuePeriods() {
    return this.freeze.freezeDuePeriods();
  }

  async closeDuePeriods(graceHours = DEFAULT_FREEZE_GRACE_HOURS) {
    return this.closer.closeDuePeriods(graceHours);
  }

  async captureEquitySnapshot(data) {
    return this.equitySnapshots.capture(data);
  }

  async captureEquityForAccount(account) {
    return this.equitySnapshots.captureForAccount(account);
  }

  async listEquitySnapshots(userId, filters, pagination) {
    return this.equitySnapshots.list(userId, filters, pagination);
  }

  async getLatestEquitySnapshot(userId, brokerAccountId) {
    return this.equitySnapshots.getLatest(userId, brokerAccountId);
  }

  async reconstructEquityCurve(userId, periodId) {
    const period = await this.repository.findPeriodById(periodId);
    if (!period || period.user_id !== userId) {
      throw new PerformancePeriodNotFoundError();
    }
    return this.equityReconstructor.reconstructForPeriod(userId, period.id);
  }

  async getSettlementForPeriod(userId, settlementPeriod) {
    const period = await this.repository.findPeriodByKey(userId, null, settlementPeriod);
    if (!period) {
      throw new PerformancePeriodNotFoundError(undefined, { settlementPeriod });
    }
    return this.periods.serialize(period);
  }
}
module.exports = PerformanceService;
module.exports.PerformanceService = PerformanceService;

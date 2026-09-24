/**
 * Referral Settlement Scheduler Service
 *
 * @module signalforge/server/modules/referrals/settlement/scheduler
 */

import { MonthlySettlementService } from './monthly-settlement.service.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export class SettlementSchedulerService {
  constructor(dependencies = {}) {
    this.monthly =
      dependencies.monthly || new MonthlySettlementService(dependencies);
    this.logger = getLogger('referral-scheduler');
    this.intervalHandle = null;
  }

  previousMonthPeriod(referenceTime = new Date()) {
    const year = referenceTime.getUTCFullYear();
    const month = referenceTime.getUTCMonth();
    const previous = new Date(Date.UTC(year, month - 1, 1));
    return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  async runForPeriod(period, options = {}) {
    this.logger.info({ period }, 'Running referral settlement');
    return this.monthly.runSettlement(period, options);
  }

  async runForPreviousMonth(options = {}) {
    const period = this.previousMonthPeriod();
    return this.runForPeriod(period, options);
  }

  start(intervalMs = DAY_MS) {
    if (this.intervalHandle) {
      return;
    }
    this.intervalHandle = setInterval(() => {
      const now = new Date();
      if (now.getUTCDate() === 1 && now.getUTCHours() === 1) {
        this.runForPreviousMonth().catch((error) => {
          this.logger.error({ err: error }, 'Scheduled settlement run failed');
        });
      }
    }, intervalMs);
    if (this.intervalHandle.unref) {
      this.intervalHandle.unref();
    }
    this.logger.info({ intervalMs }, 'Settlement scheduler started');
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}

export default SettlementSchedulerService;
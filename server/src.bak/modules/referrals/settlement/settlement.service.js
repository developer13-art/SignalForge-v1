/**
 * Referral Settlement Service (facade)
 *
 * @module signalforge/server/modules/referrals/settlement/service
 */

import { ReferralSettlementRepository } from './repository.js';
import { MonthlySettlementService } from './monthly-settlement.service.js';
import { SettlementSchedulerService } from './scheduler.js';
import { SettlementFreezeService } from './freeze.js';
import { ReferralSettlementNotFoundError } from '../referral.errors.js';

export class ReferralSettlementService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ReferralSettlementRepository();
    this.freeze = dependencies.freeze || new SettlementFreezeService();
    this.monthly =
      dependencies.monthly ||
      new MonthlySettlementService({ repository: this.repository, ...dependencies });
    this.scheduler =
      dependencies.scheduler || new SettlementSchedulerService({ monthly: this.monthly });
  }

  async runSettlement(settlementPeriod, options = {}) {
    return this.monthly.runSettlement(settlementPeriod, options);
  }

  async runPreviousMonth(options = {}) {
    const period = this.scheduler.previousMonthPeriod();
    return this.monthly.runSettlement(period, options);
  }

  async finalizeRewards(settlementPeriod) {
    return this.monthly.finalizeRewards(settlementPeriod);
  }

  async getSettlementById(settlementId) {
    const row = await this.repository.findById(settlementId);
    if (!row) {
      throw new ReferralSettlementNotFoundError();
    }
    return this.serialize(row);
  }

  async getSettlementByPeriod(settlementPeriod) {
    const row = await this.repository.findByPeriod(settlementPeriod);
    if (!row) {
      throw new ReferralSettlementNotFoundError();
    }
    return this.serialize(row);
  }

  async listSettlements(filters = {}, pagination = {}) {
    const result = await this.repository.list(filters, pagination);
    return {
      settlements: result.settlements.map((s) => this.serialize(s)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  getFreezeWindow(settlementPeriod, freezeHours) {
    return this.freeze.buildFreezeWindow(settlementPeriod, freezeHours);
  }

  isWithinFreeze(settlementPeriod, referenceTime, freezeHours) {
    return this.freeze.isWithinFreezeWindow(settlementPeriod, referenceTime, freezeHours);
  }

  startScheduler() {
    this.scheduler.start();
  }

  stopScheduler() {
    this.scheduler.stop();
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      settlementPeriod: row.settlement_period,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      totalReferrers: row.total_referrers,
      totalRewards: row.total_rewards,
      totalAmount: row.total_amount,
      currency: row.currency,
      freezeEndedAt: row.freeze_ended_at,
      summary: this.parseJson(row.summary),
      error: row.error,
      initiatedBy: row.initiated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default ReferralSettlementService;
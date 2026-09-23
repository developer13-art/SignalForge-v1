/**
 * Period Service
 *
 * @module signalforge/server/modules/performance/periods/service
 */

import { PeriodRepository } from './repository.js';
import { PeriodCalculatorService } from './calculator.js';
import { PeriodFreezeService } from './freeze.js';
import { PeriodCloserService } from './closer.js';
import { PERFORMANCE_METRIC_TYPES } from '../performance.constants.js';
import {
  PerformancePeriodNotFoundError,
  InvalidSettlementPeriodError,
  PeriodNotEditableError,
} from '../performance.errors.js';
import {
  emitPeriodOpened,
  emitPeriodUpdated,
} from '../performance.events.js';

const PERIOD_PATTERN = /^\d{4}-\d{2}$/;

function lastDayOfMonth(year, month) {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
}

function firstDayOfMonth(year, month) {
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
}

export class PeriodService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new PeriodRepository();
    this.calculator = dependencies.calculator || new PeriodCalculatorService();
    this.freeze = dependencies.freeze || new PeriodFreezeService({
      repository: this.repository,
      calculator: this.calculator,
    });
    this.closer = dependencies.closer || new PeriodCloserService({
      repository: this.repository,
      freeze: this.freeze,
    });
  }

  parseSettlementPeriod(settlementPeriod) {
    if (!PERIOD_PATTERN.test(settlementPeriod)) {
      throw new InvalidSettlementPeriodError(undefined, { settlementPeriod });
    }
    const [yearStr, monthStr] = settlementPeriod.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (month < 1 || month > 12) {
      throw new InvalidSettlementPeriodError(undefined, { settlementPeriod });
    }
    return { year, month };
  }

  buildPeriodRange(settlementPeriod) {
    const { year, month } = this.parseSettlementPeriod(settlementPeriod);
    return {
      startedAt: firstDayOfMonth(year, month),
      endsAt: lastDayOfMonth(year, month),
    };
  }

  async openPeriod(userId, payload) {
    const settlementPeriod = payload.settlementPeriod;
    const { startedAt, endsAt } = this.buildPeriodRange(settlementPeriod);

    const existing = await this.repository.findByKey(
      userId,
      payload.brokerAccountId || null,
      settlementPeriod,
    );
    if (existing) {
      return this.serialize(existing);
    }

    const created = await this.repository.create({
      userId,
      brokerAccountId: payload.brokerAccountId || null,
      settlementPeriod,
      periodType: payload.periodType || 'MONTHLY',
      status: 'OPEN',
      openingBalance: payload.openingBalance ?? null,
      startedAt,
      endsAt,
    });

    if (!created) {
      const found = await this.repository.findByKey(
        userId,
        payload.brokerAccountId || null,
        settlementPeriod,
      );
      return this.serialize(found);
    }

    await emitPeriodOpened(userId, created.id, settlementPeriod);

    const full = await this.repository.findById(created.id);
    return this.serialize(full);
  }

  async ensureCurrentPeriod(userId, brokerAccountId, options = {}) {
    const now = options.now ? new Date(options.now) : new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const settlementPeriod = `${year}-${month}`;
    return this.openPeriod(userId, {
      brokerAccountId,
      settlementPeriod,
      openingBalance: options.openingBalance,
    });
  }

  async getPeriodById(userId, periodId) {
    const period = await this.repository.findById(periodId);
    if (!period || period.user_id !== userId) {
      throw new PerformancePeriodNotFoundError();
    }
    return this.serialize(period);
  }

  async listPeriods(userId, filters = {}, pagination = {}) {
    const result = await this.repository.list(userId, filters, pagination);
    return {
      periods: result.periods.map((p) => this.serialize(p)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async updatePeriod(userId, periodId, payload) {
    const period = await this.repository.findById(periodId);
    if (!period || period.user_id !== userId) {
      throw new PerformancePeriodNotFoundError();
    }
    if (period.status !== 'OPEN') {
      throw new PeriodNotEditableError(undefined, { status: period.status });
    }
    await this.repository.update(period.id, {
      openingBalance: payload.openingBalance,
      closingBalance: payload.closingBalance,
      metadata: payload.metadata,
    });
    const updated = await this.repository.findById(period.id);
    await emitPeriodUpdated(userId, period.id, Object.keys(payload));
    return this.serialize(updated);
  }

  async calculatePeriod(userId, periodId) {
    const period = await this.repository.findById(periodId);
    if (!period || period.user_id !== userId) {
      throw new PerformancePeriodNotFoundError();
    }
    return this.calculator.calculateForPeriod(period.id);
  }

  async freezePeriod(userId, periodId) {
    const period = await this.repository.findById(periodId);
    if (!period || period.user_id !== userId) {
      throw new PerformancePeriodNotFoundError();
    }
    return this.freeze.freeze(period.id);
  }

  async closePeriod(userId, periodId, options = {}) {
    const period = await this.repository.findById(periodId);
    if (!period || period.user_id !== userId) {
      throw new PerformancePeriodNotFoundError();
    }
    return this.closer.close(period.id, options);
  }

  async getMetrics(periodId) {
    const period = await this.repository.findById(periodId);
    if (!period) {
      throw new PerformancePeriodNotFoundError();
    }
    const rows = await this.repository.performanceRepository.listMetrics(period.id);
    return rows.map((row) => this.serializeMetric(row));
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      brokerAccountId: row.broker_account_id,
      settlementPeriod: row.settlement_period,
      periodType: row.period_type,
      status: row.status,
      openingBalance: row.opening_balance,
      closingBalance: row.closing_balance,
      grossProfit: row.gross_profit,
      grossLoss: row.gross_loss,
      tradingCosts: row.trading_costs,
      eligibleNetProfit: row.eligible_net_profit,
      tradeCount: row.trade_count,
      winCount: row.win_count,
      lossCount: row.loss_count,
      startedAt: row.started_at,
      endsAt: row.ends_at,
      frozenAt: row.frozen_at,
      closedAt: row.closed_at,
      metadata: this.parseJson(row.metadata),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  serializeMetric(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      periodId: row.period_id,
      metricType: row.metric_type,
      value: this.parseJson(row.value),
      breakdown: this.parseJson(row.breakdown),
      computedAt: row.computed_at,
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

export { PERFORMANCE_METRIC_TYPES };

export default PeriodService;
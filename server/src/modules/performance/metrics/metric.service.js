/**
 * Performance Metric Service
 *
 * @module signalforge/server/modules/performance/metrics/service
 */

import { MetricRepository } from './repository.js';
import { PERFORMANCE_METRIC_TYPES } from '../performance.constants.js';
import { emitMetricCalculated } from '../performance.events.js';

export class MetricService {
  constructor(repository = null) {
    this.repository = repository || new MetricRepository();
  }

  async record(periodId, userId, metricType, value, breakdown = null) {
    const created = await this.repository.create({
      periodId,
      userId,
      metricType,
      value,
      breakdown,
    });
    await emitMetricCalculated(userId, periodId, metricType, value);
    return created;
  }

  async listForPeriod(periodId) {
    const rows = await this.repository.list(periodId);
    return rows.map((row) => this.serialize(row));
  }

  async getEligibleNetProfit(periodId) {
    const rows = await this.repository.list(periodId);
    const target = rows.find(
      (row) => row.metric_type === PERFORMANCE_METRIC_TYPES.ELIGIBLE_NET_PROFIT,
    );
    return target ? this.parseJson(target.value) : null;
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      periodId: row.period_id,
      userId: row.user_id,
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

export default MetricService;
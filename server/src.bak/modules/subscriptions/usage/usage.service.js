/**
 * Usage Service
 *
 * @module signalforge/server/modules/subscriptions/usage/service
 */

import { UsageRepository } from './repository.js';
import { UsageLimitsService } from './limits.js';
import { PlanService } from '../plans/service.js';
import { SubscriptionRepository } from '../subscription.repository.js';
import { UsageLimitExceededError } from '../subscription.errors.js';
import {
  emitUsageUpdated,
  emitUsageLimitReached,
} from '../subscription.events.js';

export class UsageService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new UsageRepository();
    this.limits = dependencies.limits || new UsageLimitsService();
    this.plans = dependencies.plans || new PlanService();
    this.subscriptions =
      dependencies.subscriptions || new SubscriptionRepository();
  }

  getPeriod(now = new Date()) {
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  async increment(userId, metric, amount = 1) {
    const subscription = await this.subscriptions.findActiveByUserId(userId);
    if (!subscription) {
      return { incremented: false, reason: 'NO_ACTIVE_SUBSCRIPTION' };
    }

    const plan = await this.plans.getByCode(subscription.plan_code);
    const period = this.getPeriod();

    const existing = await this.repository.find(subscription.id, metric, period);
    const used = Number(existing?.used || 0);

    const limitCheck = this.limits.checkLimit(plan, metric, used + amount);
    if (!limitCheck.allowed) {
      await emitUsageLimitReached(userId, subscription.id, metric, limitCheck.limit);
      throw new UsageLimitExceededError(undefined, {
        metric,
        used,
        limit: limitCheck.limit,
      });
    }

    const created = await this.repository.record({
      subscriptionId: subscription.id,
      userId,
      metric,
      period,
      used: amount,
      limitValue: limitCheck.limit,
    });

    await emitUsageUpdated(
      userId,
      subscription.id,
      metric,
      Number(created?.used || used + amount),
      limitCheck.limit,
    );

    return {
      incremented: true,
      metric,
      used: Number(created?.used || used + amount),
      limit: limitCheck.limit,
      remaining: limitCheck.remaining,
    };
  }

  async getUsageSummary(userId) {
    const subscription = await this.subscriptions.findActiveByUserId(userId);
    if (!subscription) {
      return { subscription: null, usage: [] };
    }

    const plan = await this.plans.getByCode(subscription.plan_code);
    const period = this.getPeriod();
    const rows = await this.repository.list(subscription.id, period);

    const usage = rows.map((row) => ({
      metric: row.metric,
      used: row.used,
      limit: this.limits.getLimitForMetric(plan, row.metric),
      period: row.period,
      lastIncrementedAt: row.last_incremented_at,
    }));

    return {
      subscription: { id: subscription.id, planCode: subscription.plan_code },
      period,
      usage,
    };
  }

  async check(userId, metric, amount = 0) {
    const subscription = await this.subscriptions.findActiveByUserId(userId);
    if (!subscription) {
      return { allowed: false, reason: 'NO_ACTIVE_SUBSCRIPTION' };
    }
    const plan = await this.plans.getByCode(subscription.plan_code);
    const period = this.getPeriod();
    const existing = await this.repository.find(subscription.id, metric, period);
    const used = Number(existing?.used || 0);
    return this.limits.checkLimit(plan, metric, used + amount);
  }
}

export default UsageService;
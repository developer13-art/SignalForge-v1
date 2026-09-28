/**
 * Subscription Service (facade)
 *
 * @module signalforge/server/modules/subscriptions/service
 */

import { SubscriptionRepository } from './subscription.repository.js';
import { PlanService } from './plans/service.js';
import { LifecycleService } from './lifecycle/lifecycle.service.js';
import { UsageService } from './usage/usage.service.js';
import { UpgradeService } from './upgrade/upgrade.service.js';
import { DowngradeService } from './upgrade/downgrade.service.js';
import {
  SUBSCRIPTION_STATUSES,
  SUBSCRIPTION_TRIAL_DAYS,
} from './subscription.constants.js';
import {
  SubscriptionNotFoundError,
  SubscriptionAlreadyExistsError,
} from './subscription.errors.js';
import { emitSubscriptionCreated } from './subscription.events.js';

export class SubscriptionService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new SubscriptionRepository();
    this.plans = dependencies.plans || new PlanService();
    this.lifecycle = dependencies.lifecycle || new LifecycleService({
      repository: this.repository,
    });
    this.usage =
      dependencies.usage || new UsageService({ plans: this.plans });
    this.upgrade = dependencies.upgrade || new UpgradeService({
      repository: this.repository,
      plans: this.plans,
    });
    this.downgrade = dependencies.downgrade || new DowngradeService({
      repository: this.repository,
      plans: this.plans,
    });
  }

  async subscribe(userId, payload) {
    const existing = await this.repository.findActiveByUserId(userId);
    if (existing) {
      throw new SubscriptionAlreadyExistsError();
    }

    const plan = await this.plans.getByCode(payload.planCode);

    const useTrial = payload.useTrial !== false && plan.trialDays > 0;
    const now = new Date();
    const status = useTrial ? SUBSCRIPTION_STATUSES.TRIAL : SUBSCRIPTION_STATUSES.ACTIVE;

    const trialEndsAt = useTrial
      ? new Date(now.getTime() + (plan.trialDays ?? SUBSCRIPTION_TRIAL_DAYS) * 24 * 60 * 60 * 1000)
      : null;

    const periodStart = now;
    const periodEnd = useTrial
      ? trialEndsAt
      : this.lifecycle.activation.computePeriod(plan.billingInterval).end;

    const created = await this.repository.createSubscription({
      userId,
      planId: plan.id,
      planCode: plan.code,
      status,
      billingInterval: plan.billingInterval,
      price: plan.price,
      currency: plan.currency,
      trialEndsAt,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      paymentProvider: payload.paymentProvider || null,
      startedAt: now,
    });

    await emitSubscriptionCreated(userId, created.id, plan.code);

    if (useTrial && trialEndsAt) {
      await this.lifecycle.startTrial(created.id, userId, trialEndsAt);
    } else {
      await this.lifecycle.activate(created.id, userId);
    }

    return this.getSubscription(userId, created.id);
  }

  async getSubscription(userId, subscriptionId) {
    const row = await this.repository.findSubscriptionById(subscriptionId);
    if (!row || row.user_id !== userId) {
      throw new SubscriptionNotFoundError();
    }
    return this.serialize(row);
  }

  async getActiveSubscription(userId) {
    const row = await this.repository.findActiveByUserId(userId);
    return this.serialize(row);
  }

  async getLatestSubscription(userId) {
    const row = await this.repository.findLatestByUserId(userId);
    return this.serialize(row);
  }

  async listSubscriptions(userId, filters = {}, pagination = {}) {
    const result = await this.repository.listSubscriptions(
      { ...filters, userId },
      pagination,
    );
    return {
      subscriptions: result.subscriptions.map((s) => this.serialize(s)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async cancel(userId, subscriptionId, payload) {
    return this.lifecycle.cancel(subscriptionId, userId, payload);
  }

  async resume(userId, subscriptionId) {
    return this.lifecycle.resume(subscriptionId, userId);
  }

  async upgrade(userId, targetPlanCode) {
    return this.upgrade.upgrade(userId, targetPlanCode);
  }

  async downgrade(userId, targetPlanCode) {
    return this.downgrade.downgrade(userId, targetPlanCode);
  }

  async incrementUsage(userId, metric, amount) {
    return this.usage.increment(userId, metric, amount);
  }

  async getUsageSummary(userId) {
    return this.usage.getUsageSummary(userId);
  }

  async checkUsage(userId, metric, amount) {
    return this.usage.check(userId, metric, amount);
  }

  async processLifecycleJobs() {
    return this.lifecycle.processLifecycleJobs();
  }

  isTrialActive(subscription) {
    return this.lifecycle.trial.isTrialActive(subscription);
  }

  canExecuteTrades(subscription) {
    return this.lifecycle.canExecuteTrades(subscription);
  }

  canAccessPlatform(subscription) {
    return this.lifecycle.canAccessPlatform(subscription);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      planId: row.plan_id,
      planCode: row.plan_code,
      status: row.status,
      billingInterval: row.billing_interval,
      price: row.price,
      currency: row.currency,
      trialEndsAt: row.trial_ends_at,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      gracePeriodEndsAt: row.grace_period_ends_at,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      cancelledAt: row.cancelled_at,
      cancelledReason: row.cancelled_reason,
      resumedAt: row.resumed_at,
      paymentProvider: row.payment_provider,
      externalSubscriptionId: row.external_subscription_id,
      externalCustomerId: row.external_customer_id,
      startedAt: row.started_at,
      failedPaymentAttempts: row.failed_payment_attempts,
      nextRetryAt: row.next_retry_at,
      metadata: this.parseJson(row.metadata),
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

export default SubscriptionService;
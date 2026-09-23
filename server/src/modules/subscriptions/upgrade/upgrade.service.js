/**
 * Upgrade Service
 *
 * @module signalforge/server/modules/subscriptions/upgrade/upgrade
 */

import { SubscriptionRepository } from '../subscription.repository.js';
import { PlanService } from '../plans/service.js';
import { ActivationService } from '../lifecycle/activation.service.js';
import { UpgradeFailedError } from '../subscription.errors.js';
import { emitSubscriptionUpgraded } from '../subscription.events.js';

export class UpgradeService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new SubscriptionRepository();
    this.plans = dependencies.plans || new PlanService();
    this.activation = dependencies.activation || new ActivationService();
  }

  async upgrade(userId, targetPlanCode) {
    const subscription = await this.repository.findActiveByUserId(userId);
    if (!subscription) {
      throw new UpgradeFailedError('No active subscription');
    }

    const targetPlan = await this.plans.getByCode(targetPlanCode);

    if (targetPlan.price <= subscription.price) {
      throw new UpgradeFailedError('Target plan is not an upgrade', {
        currentPrice: subscription.price,
        targetPrice: targetPlan.price,
      });
    }

    const { start, end } = this.activation.computePeriod(targetPlan.billingInterval);

    await this.repository.updateSubscription(subscription.id, {
      planId: targetPlan.id,
      planCode: targetPlan.code,
      billingInterval: targetPlan.billingInterval,
      price: targetPlan.price,
      currency: targetPlan.currency,
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      cancelledReason: null,
    });

    await emitSubscriptionUpgraded(
      userId,
      subscription.id,
      subscription.plan_code,
      targetPlan.code,
    );

    const updated = await this.repository.findSubscriptionById(subscription.id);
    return this.serialize(updated);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      planCode: row.plan_code,
      billingInterval: row.billing_interval,
      price: row.price,
      currency: row.currency,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      updatedAt: row.updated_at,
    };
  }
}

export default UpgradeService;
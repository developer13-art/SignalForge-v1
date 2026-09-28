/**
 * Downgrade Service
 *
 * @module signalforge/server/modules/subscriptions/upgrade/downgrade
 */
const { SubscriptionRepository } = require('../subscription.repository.js');
const { PlanService } = require('../plans/service.js');
const { ActivationService } = require('../lifecycle/activation.service.js');
const { DowngradeFailedError } = require('../subscription.errors.js');
const { emitSubscriptionDowngraded } = require('../subscription.events.js');

export class DowngradeService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new SubscriptionRepository();
    this.plans = dependencies.plans || new PlanService();
    this.activation = dependencies.activation || new ActivationService();
  }

  async downgrade(userId, targetPlanCode) {
    const subscription = await this.repository.findActiveByUserId(userId);
    if (!subscription) {
      throw new DowngradeFailedError('No active subscription');
    }

    const targetPlan = await this.plans.getByCode(targetPlanCode);

    if (targetPlan.price > subscription.price) {
      throw new DowngradeFailedError('Target plan is not a downgrade', {
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
    });

    await emitSubscriptionDowngraded(
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
module.exports = DowngradeService;
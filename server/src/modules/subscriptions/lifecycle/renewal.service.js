/**
 * Renewal Service
 *
 * @module signalforge/server/modules/subscriptions/lifecycle/renewal
 */

import { SubscriptionRepository } from '../subscription.repository.js';
import { ActivationService } from './activation.service.js';
import { SUBSCRIPTION_STATUSES } from '../subscription.constants.js';
import { emitSubscriptionRenewed, emitSubscriptionExpired } from '../subscription.events.js';
import { getLogger } from '../../../bootstrap/initLogger.js';

export class RenewalService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new SubscriptionRepository();
    this.activation = dependencies.activation || new ActivationService();
    this.logger = getLogger('subscription-renewal');
  }

  async renew(subscriptionId) {
    const subscription = await this.repository.findSubscriptionById(subscriptionId);
    if (!subscription) {
      return { renewed: false, reason: 'NOT_FOUND' };
    }

    if (subscription.cancel_at_period_end) {
      await this.repository.updateSubscription(subscription.id, {
        status: SUBSCRIPTION_STATUSES.EXPIRED,
      });
      await emitSubscriptionExpired(subscription.user_id, subscription.id);
      return { renewed: false, reason: 'CANCELLED_AT_PERIOD_END' };
    }

    const { start, end } = this.activation.computePeriod(subscription.billing_interval);

    await this.repository.updateSubscription(subscription.id, {
      status: SUBSCRIPTION_STATUSES.ACTIVE,
      currentPeriodStart: start,
      currentPeriodEnd: end,
      gracePeriodEndsAt: null,
      failedPaymentAttempts: 0,
      nextRetryAt: null,
    });

    await emitSubscriptionRenewed(subscription.user_id, subscription.id, end);

    return { renewed: true, currentPeriodStart: start, currentPeriodEnd: end };
  }

  async processDueRenewals() {
    const subscriptions = await this.repository.findPeriodsToRenew();
    const results = { renewed: 0, expired: 0, failed: 0 };

    for (const subscription of subscriptions) {
      try {
        const result = await this.renew(subscription.id);
        if (result.renewed) {
          results.renewed++;
        } else {
          results.expired++;
        }
      } catch (error) {
        results.failed++;
        this.logger.error({ err: error, subscriptionId: subscription.id }, 'Renewal failed');
      }
    }

    return results;
  }
}

export default RenewalService;
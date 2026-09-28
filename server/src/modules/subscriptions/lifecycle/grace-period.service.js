/**
 * Grace Period Service
 *
 * @module signalforge/server/modules/subscriptions/lifecycle/grace-period
 */
const { SubscriptionRepository } = require('../subscription.repository.js');
const { SUBSCRIPTION_STATUSES, SUBSCRIPTION_GRACE_PERIOD_DAYS } = require('../subscription.constants.js');
const { emitSubscriptionGracePeriod, emitSubscriptionExpired } = require('../subscription.events.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');
class GracePeriodService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new SubscriptionRepository();
    this.logger = getLogger('subscription-grace');
  }

  buildGraceEnd(graceDays = SUBSCRIPTION_GRACE_PERIOD_DAYS) {
    return new Date(Date.now() + graceDays * 24 * 60 * 60 * 1000);
  }

  async enter(subscriptionId) {
    const subscription = await this.repository.findSubscriptionById(subscriptionId);
    if (!subscription) {
      return { entered: false, reason: 'NOT_FOUND' };
    }

    const gracePeriodEndsAt = this.buildGraceEnd();

    await this.repository.updateSubscription(subscription.id, {
      status: SUBSCRIPTION_STATUSES.GRACE_PERIOD,
      gracePeriodEndsAt,
    });

    await emitSubscriptionGracePeriod(subscription.user_id, subscription.id, gracePeriodEndsAt);

    return { entered: true, gracePeriodEndsAt };
  }

  async processExpiredGracePeriods() {
    const subscriptions = await this.repository.findGracePeriodExpired();
    const results = { expired: 0, failed: 0 };

    for (const subscription of subscriptions) {
      try {
        await this.repository.updateSubscription(subscription.id, {
          status: SUBSCRIPTION_STATUSES.EXPIRED,
        });
        await emitSubscriptionExpired(subscription.user_id, subscription.id);
        results.expired++;
      } catch (error) {
        results.failed++;
        this.logger.error(
          { err: error, subscriptionId: subscription.id },
          'Grace period expiration failed',
        );
      }
    }

    return results;
  }
}
module.exports = GracePeriodService;
module.exports.GracePeriodService = GracePeriodService;

/**
 * Past Due Service
 *
 * @module signalforge/server/modules/subscriptions/lifecycle/past-due
 */
const { SubscriptionRepository } = require('../subscription.repository.js');
const { SUBSCRIPTION_STATUSES, SUBSCRIPTION_RETRY_INTERVAL_DAYS, SUBSCRIPTION_MAX_RETRY_ATTEMPTS } = require('../subscription.constants.js');
const { emitSubscriptionPastDue } = require('../subscription.events.js');
const { GracePeriodService } = require('./grace-period.service.js');
const { getLogger } = require('../../../bootstrap/initLogger.js');

export class PastDueService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new SubscriptionRepository();
    this.gracePeriod = dependencies.gracePeriod || new GracePeriodService({
      repository: this.repository,
    });
    this.logger = getLogger('subscription-past-due');
  }

  buildRetryTime(attempts) {
    const days = SUBSCRIPTION_RETRY_INTERVAL_DAYS * attempts;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  async markPastDue(subscriptionId, attempts = 1) {
    const subscription = await this.repository.findSubscriptionById(subscriptionId);
    if (!subscription) {
      return { flagged: false, reason: 'NOT_FOUND' };
    }

    if (attempts >= SUBSCRIPTION_MAX_RETRY_ATTEMPTS) {
      return this.gracePeriod.enter(subscription.id);
    }

    const nextRetryAt = this.buildRetryTime(attempts);

    await this.repository.updateSubscription(subscription.id, {
      status: SUBSCRIPTION_STATUSES.PAST_DUE,
      failedPaymentAttempts: attempts,
      nextRetryAt,
    });

    await emitSubscriptionPastDue(subscription.user_id, subscription.id, attempts);

    return { flagged: true, nextRetryAt, attempts };
  }

  async processRetries() {
    const subscriptions = await this.repository.findPastDueForRetry();
    const results = { retried: 0, movedToGrace: 0, failed: 0 };

    for (const subscription of subscriptions) {
      try {
        const attempts = Number(subscription.failed_payment_attempts || 0) + 1;
        const result = await this.markPastDue(subscription.id, attempts);
        if (result.flagged) {
          results.retried++;
        } else {
          results.movedToGrace++;
        }
      } catch (error) {
        results.failed++;
        this.logger.error(
          { err: error, subscriptionId: subscription.id },
          'Past due retry failed',
        );
      }
    }

    return results;
  }
}
module.exports = PastDueService;
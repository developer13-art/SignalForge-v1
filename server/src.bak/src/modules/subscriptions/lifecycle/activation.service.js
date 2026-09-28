/**
 * Activation Service
 *
 * @module signalforge/server/modules/subscriptions/lifecycle/activation
 */
const { SUBSCRIPTION_STATUSES } = require('../subscription.constants.js');
const { emitSubscriptionActivated } = require('../subscription.events.js');

export class ActivationService {
  constructor(repository = null) {
    this.repository = repository;
  }

  computePeriod(billingInterval, from = new Date()) {
    const start = new Date(from);
    const end = new Date(start);

    switch (billingInterval) {
      case 'YEARLY':
        end.setUTCFullYear(end.getUTCFullYear() + 1);
        break;
      case 'LIFETIME':
        end.setUTCFullYear(end.getUTCFullYear() + 100);
        break;
      case 'MONTHLY':
      default:
        end.setUTCMonth(end.getUTCMonth() + 1);
        break;
    }

    return { start, end };
  }

  async activate(subscriptionId, userId) {
    await emitSubscriptionActivated(userId, subscriptionId);
    return { activated: true };
  }

  isActive(subscription) {
    if (!subscription) {
      return false;
    }
    return subscription.status === SUBSCRIPTION_STATUSES.ACTIVE;
  }
}
module.exports = ActivationService;
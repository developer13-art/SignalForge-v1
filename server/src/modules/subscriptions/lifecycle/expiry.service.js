/**
 * Expiry Service
 *
 * @module signalforge/server/modules/subscriptions/lifecycle/expiry
 */

import { SubscriptionRepository } from '../subscription.repository.js';
import { SUBSCRIPTION_STATUSES } from '../subscription.constants.js';
import { emitSubscriptionExpired } from '../subscription.events.js';

export class ExpiryService {
  constructor(repository = null) {
    this.repository = repository || new SubscriptionRepository();
  }

  async expire(subscriptionId, reason = 'PERIOD_ENDED') {
    const subscription = await this.repository.findSubscriptionById(subscriptionId);
    if (!subscription) {
      return { expired: false, reason: 'NOT_FOUND' };
    }
    if (subscription.status === SUBSCRIPTION_STATUSES.EXPIRED) {
      return { expired: false, reason: 'ALREADY_EXPIRED' };
    }

    await this.repository.updateSubscription(subscription.id, {
      status: SUBSCRIPTION_STATUSES.EXPIRED,
    });

    await emitSubscriptionExpired(subscription.user_id, subscription.id, { reason });

    return { expired: true };
  }

  isExpired(subscription) {
    if (!subscription) {
      return false;
    }
    return subscription.status === SUBSCRIPTION_STATUSES.EXPIRED;
  }

  isAccessExpired(subscription) {
    if (!subscription) {
      return true;
    }
    if (subscription.status === SUBSCRIPTION_STATUSES.EXPIRED) {
      return false;
    }
    return true;
  }
}

export default ExpiryService;
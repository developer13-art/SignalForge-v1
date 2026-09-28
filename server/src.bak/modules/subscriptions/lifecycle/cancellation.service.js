/**
 * Cancellation Service
 *
 * @module signalforge/server/modules/subscriptions/lifecycle/cancellation
 */

import { SubscriptionRepository } from '../subscription.repository.js';
import { SUBSCRIPTION_STATUSES } from '../subscription.constants.js';
import { emitSubscriptionCancelled } from '../subscription.events.js';
import { SubscriptionNotCancellableError } from '../subscription.errors.js';

export class CancellationService {
  constructor(repository = null) {
    this.repository = repository || new SubscriptionRepository();
  }

  async cancel(subscriptionId, userId, payload = {}) {
    const subscription = await this.repository.findSubscriptionById(subscriptionId);
    if (!subscription || subscription.user_id !== userId) {
      throw new SubscriptionNotCancellableError('Subscription not found');
    }

    const cancellableStatuses = ['TRIAL', 'ACTIVE', 'PAST_DUE', 'GRACE_PERIOD'];
    if (!cancellableStatuses.includes(subscription.status)) {
      throw new SubscriptionNotCancellableError(undefined, { status: subscription.status });
    }

    const immediate = payload.immediate === true;

    if (immediate) {
      await this.repository.updateSubscription(subscription.id, {
        status: SUBSCRIPTION_STATUSES.CANCELLED,
        cancelledAt: new Date(),
        cancelledReason: payload.reason || null,
        cancelAtPeriodEnd: false,
      });
    } else {
      await this.repository.updateSubscription(subscription.id, {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
        cancelledReason: payload.reason || null,
      });
    }

    await emitSubscriptionCancelled(
      userId,
      subscription.id,
      payload.reason || 'USER_REQUESTED',
      { immediate },
    );

    const updated = await this.repository.findSubscriptionById(subscription.id);
    return this.serialize(updated);
  }

  async resume(subscriptionId, userId) {
    const subscription = await this.repository.findSubscriptionById(subscriptionId);
    if (!subscription || subscription.user_id !== userId) {
      throw new SubscriptionNotCancellableError('Subscription not found');
    }
    if (!subscription.cancel_at_period_end || subscription.cancelled_at === null) {
      throw new SubscriptionNotCancellableError('Subscription is not pending cancellation');
    }

    await this.repository.updateSubscription(subscription.id, {
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      cancelledReason: null,
      resumedAt: new Date(),
    });

    return { resumed: true };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      planCode: row.plan_code,
      status: row.status,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      cancelledAt: row.cancelled_at,
      cancelledReason: row.cancelled_reason,
      currentPeriodEnd: row.current_period_end,
      updatedAt: row.updated_at,
    };
  }
}

export default CancellationService;
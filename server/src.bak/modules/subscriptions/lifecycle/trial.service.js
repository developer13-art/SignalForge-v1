/**
 * Trial Service
 *
 * @module signalforge/server/modules/subscriptions/lifecycle/trial
 */

import { SUBSCRIPTION_STATUSES, SUBSCRIPTION_TRIAL_DAYS } from '../subscription.constants.js';
import { emitTrialStarted, emitTrialEnding } from '../subscription.events.js';

export class TrialService {
  constructor(repository = null) {
    this.repository = repository;
  }

  buildTrialPeriod(trialDays) {
    const days = trialDays ?? SUBSCRIPTION_TRIAL_DAYS;
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return {
      status: SUBSCRIPTION_STATUSES.TRIAL,
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd: trialEndsAt,
    };
  }

  async startTrial(subscriptionId, userId, trialEndsAt) {
    await emitTrialStarted(userId, subscriptionId, trialEndsAt);
    return { trialStarted: true, trialEndsAt };
  }

  isTrialActive(subscription) {
    if (!subscription || subscription.status !== SUBSCRIPTION_STATUSES.TRIAL) {
      return false;
    }
    if (!subscription.trial_ends_at) {
      return false;
    }
    return new Date(subscription.trial_ends_at).getTime() > Date.now();
  }

  async notifyEndingTrials(hoursBefore = 48) {
    if (!this.repository) {
      return { notified: 0 };
    }
    const subscriptions = await this.repository.findTrialsEndingSoon(hoursBefore);
    for (const subscription of subscriptions) {
      await emitTrialEnding(
        subscription.user_id,
        subscription.id,
        subscription.trial_ends_at,
      );
    }
    return { notified: subscriptions.length };
  }
}

export default TrialService;
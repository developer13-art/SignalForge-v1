/**
 * Lifecycle Service
 *
 * @module signalforge/server/modules/subscriptions/lifecycle/service
 */

import { SubscriptionRepository } from '../subscription.repository.js';
import { TrialService } from './trial.service.js';
import { ActivationService } from './activation.service.js';
import { RenewalService } from './renewal.service.js';
import { GracePeriodService } from './grace-period.service.js';
import { PastDueService } from './past-due.service.js';
import { ExpiryService } from './expiry.service.js';
import { CancellationService } from './cancellation.service.js';
import { SUBSCRIPTION_STATUSES } from '../subscription.constants.js';

export class LifecycleService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new SubscriptionRepository();

    this.trial = dependencies.trial || new TrialService(this.repository);
    this.activation = dependencies.activation || new ActivationService(this.repository);
    this.renewal =
      dependencies.renewal ||
      new RenewalService({
        repository: this.repository,
        activation: this.activation,
      });
    this.gracePeriod =
      dependencies.gracePeriod ||
      new GracePeriodService({ repository: this.repository });
    this.pastDue =
      dependencies.pastDue ||
      new PastDueService({
        repository: this.repository,
        gracePeriod: this.gracePeriod,
      });
    this.expiry = dependencies.expiry || new ExpiryService(this.repository);
    this.cancellation =
      dependencies.cancellation ||
      new CancellationService(this.repository);
  }

  async startTrial(subscriptionId, userId, trialEndsAt) {
    return this.trial.startTrial(subscriptionId, userId, trialEndsAt);
  }

  async activate(subscriptionId, userId) {
    return this.activation.activate(subscriptionId, userId);
  }

  async renew(subscriptionId) {
    return this.renewal.renew(subscriptionId);
  }

  async enterGracePeriod(subscriptionId) {
    return this.gracePeriod.enter(subscriptionId);
  }

  async markPastDue(subscriptionId, attempts) {
    return this.pastDue.markPastDue(subscriptionId, attempts);
  }

  async expire(subscriptionId, reason) {
    return this.expiry.expire(subscriptionId, reason);
  }

  async cancel(subscriptionId, userId, payload) {
    return this.cancellation.cancel(subscriptionId, userId, payload);
  }

  async resume(subscriptionId, userId) {
    return this.cancellation.resume(subscriptionId, userId);
  }

  async processLifecycleJobs() {
    const results = {};
    results.trialsEnding = await this.trial.notifyEndingTrials();
    results.renewals = await this.renewal.processDueRenewals();
    results.pastDue = await this.pastDue.processRetries();
    results.gracePeriod = await this.gracePeriod.processExpiredGracePeriods();
    return results;
  }

  isActive(subscription) {
    if (!subscription) {
      return false;
    }
    return [
      SUBSCRIPTION_STATUSES.TRIAL,
      SUBSCRIPTION_STATUSES.ACTIVE,
    ].includes(subscription.status);
  }

  canExecuteTrades(subscription) {
    if (!subscription) {
      return false;
    }
    return [
      SUBSCRIPTION_STATUSES.TRIAL,
      SUBSCRIPTION_STATUSES.ACTIVE,
    ].includes(subscription.status);
  }

  canAccessPlatform(subscription) {
    if (!subscription) {
      return false;
    }
    return [
      SUBSCRIPTION_STATUSES.TRIAL,
      SUBSCRIPTION_STATUSES.ACTIVE,
      SUBSCRIPTION_STATUSES.PAST_DUE,
      SUBSCRIPTION_STATUSES.GRACE_PERIOD,
      SUBSCRIPTION_STATUSES.EXPIRED,
    ].includes(subscription.status);
  }
}

export default LifecycleService;
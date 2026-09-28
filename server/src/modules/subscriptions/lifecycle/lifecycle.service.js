/**
 * Lifecycle Service
 *
 * @module signalforge/server/modules/subscriptions/lifecycle/service
 */
const { SubscriptionRepository } = require('../subscription.repository.js');
const { TrialService } = require('./trial.service.js');
const { ActivationService } = require('./activation.service.js');
const { RenewalService } = require('./renewal.service.js');
const { GracePeriodService } = require('./grace-period.service.js');
const { PastDueService } = require('./past-due.service.js');
const { ExpiryService } = require('./expiry.service.js');
const { CancellationService } = require('./cancellation.service.js');
const { SUBSCRIPTION_STATUSES } = require('../subscription.constants.js');
class LifecycleService {
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
module.exports = LifecycleService;
module.exports.LifecycleService = LifecycleService;

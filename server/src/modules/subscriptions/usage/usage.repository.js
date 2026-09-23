/**
 * Usage Repository
 *
 * @module signalforge/server/modules/subscriptions/usage/repository
 */

import { SubscriptionRepository } from '../subscription.repository.js';

export class UsageRepository {
  constructor(db = null) {
    this.subscriptionRepository = new SubscriptionRepository(db);
  }

  async record(data) {
    return this.subscriptionRepository.createUsageRecord(data);
  }

  async find(subscriptionId, metric, period) {
    return this.subscriptionRepository.findUsage(subscriptionId, metric, period);
  }

  async list(subscriptionId, period) {
    return this.subscriptionRepository.listUsageForSubscription(subscriptionId, period);
  }

  async deleteForSubscription(subscriptionId) {
    return this.subscriptionRepository.deleteUsage(subscriptionId);
  }
}

export default UsageRepository;
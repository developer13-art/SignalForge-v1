/**
 * Plan Repository
 *
 * @module signalforge/server/modules/subscriptions/plans/repository
 */

import { SubscriptionRepository } from '../subscription.repository.js';

export class PlanRepository {
  constructor(db = null) {
    this.subscriptionRepository = new SubscriptionRepository(db);
  }

  async create(data) {
    return this.subscriptionRepository.createPlan(data);
  }

  async findByCode(code) {
    return this.subscriptionRepository.findPlanByCode(code);
  }

  async findById(planId) {
    return this.subscriptionRepository.findPlanById(planId);
  }

  async list(filters) {
    return this.subscriptionRepository.listPlans(filters);
  }

  async update(planId, data) {
    return this.subscriptionRepository.updatePlan(planId, data);
  }

  async delete(planId) {
    return this.subscriptionRepository.deletePlan(planId);
  }
}

export default PlanRepository;
/**
 * Plan Service
 *
 * @module signalforge/server/modules/subscriptions/plans/service
 */

import { PlanRepository } from './repository.js';
import { PlanFeatureService } from './feature.js';
import { SubscriptionRepository } from '../subscription.repository.js';
import {
  PlanNotFoundError,
  PlanAlreadyExistsError,
  PlanNotEditableError,
} from '../subscription.errors.js';
import {
  emitPlanCreated,
  emitPlanUpdated,
  emitPlanDeleted,
} from '../subscription.events.js';

export class PlanService {
  constructor(repository = null, featureService = null, subscriptionRepository = null) {
    this.repository = repository || new PlanRepository();
    this.features = featureService || new PlanFeatureService();
    this.subscriptionRepository =
      subscriptionRepository || new SubscriptionRepository();
  }

  async create(payload) {
    const existing = await this.repository.findByCode(payload.code);
    if (existing) {
      throw new PlanAlreadyExistsError();
    }

    const mergedFeatures = this.features.mergeFeatures(payload.code, payload.features);
    const limits = payload.limits || this.buildDefaultLimits(payload.code);

    const created = await this.repository.create({
      code: payload.code,
      name: payload.name,
      description: payload.description || null,
      price: payload.price,
      currency: payload.currency || 'USD',
      billingInterval: payload.billingInterval,
      trialDays: payload.trialDays ?? 7,
      features: mergedFeatures,
      limits,
      isActive: payload.isActive !== false,
      displayOrder: payload.displayOrder ?? 100,
      metadata: payload.metadata || null,
    });

    await emitPlanCreated(created.id, created.code);

    return this.getById(created.id);
  }

  buildDefaultLimits(planCode) {
    const features = this.features.getDefaultFeatures(planCode);
    return {
      signal_sources: features.signal_sources,
      broker_accounts: features.broker_accounts,
      ai_limits: features.ai_limits,
    };
  }

  async getById(planId) {
    const plan = await this.repository.findById(planId);
    if (!plan) {
      throw new PlanNotFoundError();
    }
    return this.serialize(plan);
  }

  async getByCode(code) {
    const plan = await this.repository.findByCode(code);
    if (!plan) {
      throw new PlanNotFoundError(undefined, { code });
    }
    return this.serialize(plan);
  }

  async list(filters = {}) {
    const plans = await this.repository.list(filters);
    return plans.map((p) => this.serialize(p));
  }

  async update(planId, payload) {
    const plan = await this.repository.findById(planId);
    if (!plan) {
      throw new PlanNotFoundError();
    }

    const mergedFeatures =
      payload.features !== undefined
        ? this.features.mergeFeatures(plan.code, payload.features)
        : undefined;

    await this.repository.update(planId, {
      ...payload,
      features: mergedFeatures,
    });

    const updated = await this.repository.findById(planId);
    await emitPlanUpdated(planId, plan.code, Object.keys(payload));
    return this.serialize(updated);
  }

  async delete(planId) {
    const plan = await this.repository.findById(planId);
    if (!plan) {
      throw new PlanNotFoundError();
    }

    const activeCount = await this.countActiveSubscribers(plan.id);
    if (activeCount > 0) {
      throw new PlanNotEditableError(undefined, { activeSubscriptions: activeCount });
    }

    await this.repository.delete(planId);
    await emitPlanDeleted(planId, plan.code);
    return { deleted: true };
  }

  async countActiveSubscribers(planId) {
    const result = await this.subscriptionRepository.db.query(
      `SELECT COUNT(*)::int AS count
         FROM subscriptions
        WHERE plan_id = $1
          AND status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'GRACE_PERIOD')`,
      [planId],
    );
    return result.rows[0]?.count || 0;
  }

  getFeature(plan, featureKey) {
    return this.features.getFeature(plan.features, featureKey);
  }

  featureEnabled(plan, featureKey) {
    return this.features.featureEnabled(plan.features, featureKey);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      price: row.price,
      currency: row.currency,
      billingInterval: row.billing_interval,
      trialDays: row.trial_days,
      features: this.parseJson(row.features),
      limits: this.parseJson(row.limits),
      isActive: row.is_active,
      displayOrder: row.display_order,
      metadata: this.parseJson(row.metadata),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  parseJson(input) {
    if (!input) {
      return null;
    }
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        return null;
      }
    }
    return input;
  }
}

export default PlanService;
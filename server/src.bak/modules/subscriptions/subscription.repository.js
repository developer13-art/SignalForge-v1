/**
 * Subscription Repository
 *
 * @module signalforge/server/modules/subscriptions/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class SubscriptionRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createPlan(data) {
    const result = await this.db.query(
      `INSERT INTO subscription_plans (
         code, name, description, price, currency, billing_interval,
         trial_days, features, limits, is_active, display_order, metadata,
         created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING id, code, name, price, currency, billing_interval, is_active, created_at`,
      [
        data.code,
        data.name,
        data.description || null,
        data.price,
        data.currency || 'USD',
        data.billingInterval,
        data.trialDays ?? 7,
        data.features ? JSON.stringify(data.features) : null,
        data.limits ? JSON.stringify(data.limits) : null,
        data.isActive !== false,
        data.displayOrder ?? 100,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findPlanByCode(code) {
    const result = await this.db.query(
      `SELECT id, code, name, description, price, currency, billing_interval,
              trial_days, features, limits, is_active, display_order, metadata,
              created_at, updated_at
         FROM subscription_plans
        WHERE code = $1
        LIMIT 1`,
      [code],
    );
    return result.rows[0] || null;
  }

  async findPlanById(planId) {
    const result = await this.db.query(
      `SELECT id, code, name, description, price, currency, billing_interval,
              trial_days, features, limits, is_active, display_order, metadata,
              created_at, updated_at
         FROM subscription_plans
        WHERE id = $1
        LIMIT 1`,
      [planId],
    );
    return result.rows[0] || null;
  }

  async listPlans(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.isActive !== undefined) {
      conditions.push(`is_active = $${index++}`);
      values.push(filters.isActive);
    }

    if (filters.billingInterval) {
      conditions.push(`billing_interval = $${index++}`);
      values.push(filters.billingInterval);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT id, code, name, description, price, currency, billing_interval,
              trial_days, features, limits, is_active, display_order, created_at, updated_at
         FROM subscription_plans
         ${where}
        ORDER BY display_order ASC, price ASC`,
      values,
    );
    return result.rows;
  }

  async updatePlan(planId, data) {
    const fields = [];
    const values = [planId];
    let index = 2;

    const mapping = {
      name: 'name',
      description: 'description',
      price: 'price',
      currency: 'currency',
      billingInterval: 'billing_interval',
      trialDays: 'trial_days',
      isActive: 'is_active',
      displayOrder: 'display_order',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.features !== undefined) {
      fields.push(`features = $${index++}`);
      values.push(data.features ? JSON.stringify(data.features) : null);
    }
    if (data.limits !== undefined) {
      fields.push(`limits = $${index++}`);
      values.push(data.limits ? JSON.stringify(data.limits) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findPlanById(planId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE subscription_plans SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findPlanById(planId);
  }

  async deletePlan(planId) {
    await this.db.query('DELETE FROM subscription_plans WHERE id = $1', [planId]);
  }

  async createSubscription(data) {
    const result = await this.db.query(
      `INSERT INTO subscriptions (
         user_id, plan_id, plan_code, status, billing_interval, price, currency,
         trial_ends_at, current_period_start, current_period_end, grace_period_ends_at,
         cancel_at_period_end, cancelled_at, cancelled_reason, resumed_at,
         payment_provider, external_subscription_id, external_customer_id,
         started_at, metadata, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         $17, $18, $19, $20, NOW(), NOW()
       )
       RETURNING id, user_id, plan_id, plan_code, status, current_period_start,
                 current_period_end, trial_ends_at, created_at`,
      [
        data.userId,
        data.planId,
        data.planCode,
        data.status,
        data.billingInterval,
        data.price,
        data.currency || 'USD',
        data.trialEndsAt || null,
        data.currentPeriodStart || null,
        data.currentPeriodEnd || null,
        data.gracePeriodEndsAt || null,
        data.cancelAtPeriodEnd === true,
        data.cancelledAt || null,
        data.cancelledReason || null,
        data.resumedAt || null,
        data.paymentProvider || null,
        data.externalSubscriptionId || null,
        data.externalCustomerId || null,
        data.startedAt || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findSubscriptionById(subscriptionId) {
    const result = await this.db.query(
      `SELECT id, user_id, plan_id, plan_code, status, billing_interval, price,
              currency, trial_ends_at, current_period_start, current_period_end,
              grace_period_ends_at, cancel_at_period_end, cancelled_at,
              cancelled_reason, resumed_at, payment_provider,
              external_subscription_id, external_customer_id, started_at,
              failed_payment_attempts, next_retry_at, metadata,
              created_at, updated_at
         FROM subscriptions
        WHERE id = $1
        LIMIT 1`,
      [subscriptionId],
    );
    return result.rows[0] || null;
  }

  async findActiveByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, plan_id, plan_code, status, billing_interval, price,
              currency, trial_ends_at, current_period_start, current_period_end,
              grace_period_ends_at, cancel_at_period_end, cancelled_at,
              payment_provider, external_subscription_id, started_at,
              created_at, updated_at
         FROM subscriptions
        WHERE user_id = $1
          AND status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'GRACE_PERIOD')
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findLatestByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, plan_id, plan_code, status, billing_interval, price,
              currency, trial_ends_at, current_period_start, current_period_end,
              grace_period_ends_at, cancel_at_period_end, cancelled_at,
              payment_provider, external_subscription_id, started_at,
              created_at, updated_at
         FROM subscriptions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findByExternalSubscriptionId(externalId) {
    const result = await this.db.query(
      `SELECT id, user_id, plan_id, plan_code, status, billing_interval, price,
              currency, current_period_start, current_period_end, payment_provider,
              external_subscription_id, created_at
         FROM subscriptions
        WHERE external_subscription_id = $1
        LIMIT 1`,
      [externalId],
    );
    return result.rows[0] || null;
  }

  async updateSubscription(subscriptionId, data) {
    const fields = [];
    const values = [subscriptionId];
    let index = 2;

    const mapping = {
      status: 'status',
      planId: 'plan_id',
      planCode: 'plan_code',
      billingInterval: 'billing_interval',
      price: 'price',
      currency: 'currency',
      trialEndsAt: 'trial_ends_at',
      currentPeriodStart: 'current_period_start',
      currentPeriodEnd: 'current_period_end',
      gracePeriodEndsAt: 'grace_period_ends_at',
      cancelAtPeriodEnd: 'cancel_at_period_end',
      cancelledAt: 'cancelled_at',
      cancelledReason: 'cancelled_reason',
      resumedAt: 'resumed_at',
      paymentProvider: 'payment_provider',
      externalSubscriptionId: 'external_subscription_id',
      externalCustomerId: 'external_customer_id',
      startedAt: 'started_at',
      failedPaymentAttempts: 'failed_payment_attempts',
      nextRetryAt: 'next_retry_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findSubscriptionById(subscriptionId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );

    return this.findSubscriptionById(subscriptionId);
  }

  async listSubscriptions(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${index++}`);
      values.push(filters.userId);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(`status = ANY($${index++}::text[])`);
        values.push(filters.status);
      } else {
        conditions.push(`status = $${index++}`);
        values.push(filters.status);
      }
    }

    if (filters.planCode) {
      conditions.push(`plan_code = $${index++}`);
      values.push(filters.planCode);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM subscriptions ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, plan_id, plan_code, status, billing_interval, price,
              currency, trial_ends_at, current_period_start, current_period_end,
              grace_period_ends_at, cancel_at_period_end, cancelled_at,
              created_at, updated_at
         FROM subscriptions
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { subscriptions: result.rows, total, limit, offset };
  }

  async findTrialsEndingSoon(hours = 48) {
    const result = await this.db.query(
      `SELECT id, user_id, plan_code, trial_ends_at
         FROM subscriptions
        WHERE status = 'TRIAL'
          AND trial_ends_at IS NOT NULL
          AND trial_ends_at <= NOW() + ($1::int * interval '1 hour')
        ORDER BY trial_ends_at ASC`,
      [hours],
    );
    return result.rows;
  }

  async findPastDueForRetry() {
    const result = await this.db.query(
      `SELECT id, user_id, plan_code, failed_payment_attempts, next_retry_at
         FROM subscriptions
        WHERE status = 'PAST_DUE'
          AND (next_retry_at IS NULL OR next_retry_at <= NOW())
        ORDER BY next_retry_at ASC NULLS FIRST`,
    );
    return result.rows;
  }

  async findGracePeriodExpired() {
    const result = await this.db.query(
      `SELECT id, user_id, plan_code, grace_period_ends_at
         FROM subscriptions
        WHERE status = 'GRACE_PERIOD'
          AND grace_period_ends_at IS NOT NULL
          AND grace_period_ends_at <= NOW()
        ORDER BY grace_period_ends_at ASC`,
    );
    return result.rows;
  }

  async findPeriodsToRenew() {
    const result = await this.db.query(
      `SELECT id, user_id, plan_code, current_period_end, cancel_at_period_end
         FROM subscriptions
        WHERE status IN ('ACTIVE', 'PAST_DUE')
          AND current_period_end IS NOT NULL
          AND current_period_end <= NOW()
        ORDER BY current_period_end ASC`,
    );
    return result.rows;
  }

  async countByStatus() {
    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM subscriptions
        GROUP BY status`,
    );
    return result.rows;
  }

  async countByPlan() {
    const result = await this.db.query(
      `SELECT plan_code, COUNT(*)::int AS count
         FROM subscriptions
        WHERE status IN ('TRIAL', 'ACTIVE')
        GROUP BY plan_code`,
    );
    return result.rows;
  }

  async countByUserPlan(userId) {
    const result = await this.db.query(
      `SELECT plan_code, COUNT(*)::int AS count
         FROM subscriptions
        WHERE user_id = $1
        GROUP BY plan_code`,
      [userId],
    );
    return result.rows;
  }

  async createUsageRecord(data) {
    const result = await this.db.query(
      `INSERT INTO subscription_usage (
         subscription_id, user_id, metric, period, used, limit_value,
         last_incremented_at, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, NOW(), NOW())
       ON CONFLICT (subscription_id, metric, period) DO UPDATE
       SET used = subscription_usage.used + EXCLUDED.used,
           last_incremented_at = NOW(),
           updated_at = NOW()
       RETURNING id, subscription_id, metric, period, used, limit_value`,
      [
        data.subscriptionId,
        data.userId,
        data.metric,
        data.period,
        data.used ?? 1,
        data.limitValue ?? null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findUsage(subscriptionId, metric, period) {
    const result = await this.db.query(
      `SELECT id, subscription_id, user_id, metric, period, used, limit_value,
              last_incremented_at, metadata, created_at, updated_at
         FROM subscription_usage
        WHERE subscription_id = $1 AND metric = $2 AND period = $3
        LIMIT 1`,
      [subscriptionId, metric, period],
    );
    return result.rows[0] || null;
  }

  async listUsageForSubscription(subscriptionId, period = null) {
    const values = [subscriptionId];
    let query = `
      SELECT id, subscription_id, user_id, metric, period, used, limit_value,
             last_incremented_at, updated_at
        FROM subscription_usage
       WHERE subscription_id = $1
    `;
    if (period) {
      query += ` AND period = $2`;
      values.push(period);
    }
    query += ` ORDER BY metric ASC`;
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async deleteUsage(subscriptionId) {
    await this.db.query('DELETE FROM subscription_usage WHERE subscription_id = $1', [
      subscriptionId,
    ]);
  }
}

export default SubscriptionRepository;
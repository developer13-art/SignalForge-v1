/**
 * Provider Repository
 *
 * @module signalforge/server/modules/providers/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class ProviderRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async create(data) {
    const result = await this.db.query(
      `INSERT INTO providers (
         user_id, display_name, slug, bio, avatar_url, provider_type, status,
         visibility, certification_status, certification_version,
         subscriber_count, total_signals, validated_signals, executed_signals,
         winning_trades, losing_trades, win_rate, average_rr, consistency_score,
         reputation_score, solana_attestation_id, language, timezone,
         website_url, social_links, tags, metadata, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
         $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NOW(), NOW()
       )
       ON CONFLICT (user_id) DO NOTHING
       RETURNING id, user_id, display_name, slug, status, certification_status, created_at`,
      [
        data.userId,
        data.displayName,
        data.slug,
        data.bio || null,
        data.avatarUrl || null,
        data.providerType || 'SIGNAL_PROVIDER',
        data.status || 'PENDING',
        data.visibility || 'PUBLIC',
        data.certificationStatus || 'NOT_STARTED',
        data.certificationVersion || null,
        data.subscriberCount ?? 0,
        data.totalSignals ?? 0,
        data.validatedSignals ?? 0,
        data.executedSignals ?? 0,
        data.winningTrades ?? 0,
        data.losingTrades ?? 0,
        data.winRate ?? null,
        data.averageRr ?? null,
        data.consistencyScore ?? null,
        data.reputationScore ?? null,
        data.solanaAttestationId || null,
        data.language || null,
        data.timezone || null,
        data.websiteUrl || null,
        data.socialLinks ? JSON.stringify(data.socialLinks) : null,
        data.tags || [],
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findById(providerId) {
    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, avatar_url, provider_type,
              status, visibility, certification_status, certification_version,
              subscriber_count, total_signals, validated_signals, executed_signals,
              winning_trades, losing_trades, win_rate, average_rr, consistency_score,
              reputation_score, solana_attestation_id, language, timezone,
              website_url, social_links, tags, metadata, suspended_at,
              approved_at, created_at, updated_at
         FROM providers
        WHERE id = $1
        LIMIT 1`,
      [providerId],
    );
    return result.rows[0] || null;
  }

  async findByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, avatar_url, provider_type,
              status, visibility, certification_status, certification_version,
              subscriber_count, total_signals, winning_trades, win_rate,
              average_rr, consistency_score, reputation_score, created_at, updated_at
         FROM providers
        WHERE user_id = $1
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findBySlug(slug) {
    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, avatar_url, provider_type,
              status, visibility, certification_status, subscriber_count,
              win_rate, average_rr, consistency_score, reputation_score,
              created_at, updated_at
         FROM providers
        WHERE slug = $1
        LIMIT 1`,
      [slug],
    );
    return result.rows[0] || null;
  }

  async list(filters = {}, pagination = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(`status = ANY($${index++}::text[])`);
        values.push(filters.status);
      } else {
        conditions.push(`status = $${index++}`);
        values.push(filters.status);
      }
    }

    if (filters.certificationStatus) {
      conditions.push(`certification_status = $${index++}`);
      values.push(filters.certificationStatus);
    }

    if (filters.visibility) {
      conditions.push(`visibility = $${index++}`);
      values.push(filters.visibility);
    }

    if (filters.providerType) {
      conditions.push(`provider_type = $${index++}`);
      values.push(filters.providerType);
    }

    if (filters.search) {
      conditions.push(
        `(display_name ILIKE $${index} OR slug ILIKE $${index} OR bio ILIKE $${index})`,
      );
      values.push(`%${filters.search}%`);
      index++;
    }

    if (filters.minSubscribers !== undefined) {
      conditions.push(`subscriber_count >= $${index++}`);
      values.push(filters.minSubscribers);
    }

    if (filters.minWinRate !== undefined) {
      conditions.push(`win_rate >= $${index++}`);
      values.push(filters.minWinRate);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM providers ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, avatar_url, provider_type,
              status, visibility, certification_status, subscriber_count,
              total_signals, win_rate, average_rr, consistency_score,
              reputation_score, created_at, updated_at
         FROM providers
         ${where}
        ORDER BY reputation_score DESC NULLS LAST, subscriber_count DESC, created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { providers: result.rows, total, limit, offset };
  }

  async update(providerId, data) {
    const fields = [];
    const values = [providerId];
    let index = 2;

    const mapping = {
      displayName: 'display_name',
      slug: 'slug',
      bio: 'bio',
      avatarUrl: 'avatar_url',
      providerType: 'provider_type',
      status: 'status',
      visibility: 'visibility',
      certificationStatus: 'certification_status',
      certificationVersion: 'certification_version',
      subscriberCount: 'subscriber_count',
      totalSignals: 'total_signals',
      validatedSignals: 'validated_signals',
      executedSignals: 'executed_signals',
      winningTrades: 'winning_trades',
      losingTrades: 'losing_trades',
      winRate: 'win_rate',
      averageRr: 'average_rr',
      consistencyScore: 'consistency_score',
      reputationScore: 'reputation_score',
      solanaAttestationId: 'solana_attestation_id',
      language: 'language',
      timezone: 'timezone',
      websiteUrl: 'website_url',
      suspendedAt: 'suspended_at',
      approvedAt: 'approved_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.socialLinks !== undefined) {
      fields.push(`social_links = $${index++}`);
      values.push(data.socialLinks ? JSON.stringify(data.socialLinks) : null);
    }
    if (data.tags !== undefined) {
      fields.push(`tags = $${index++}`);
      values.push(data.tags);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findById(providerId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE providers SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findById(providerId);
  }

  async delete(providerId) {
    await this.db.query('DELETE FROM providers WHERE id = $1', [providerId]);
  }

  async incrementSubscriberCount(providerId) {
    await this.db.query(
      `UPDATE providers
          SET subscriber_count = subscriber_count + 1,
              updated_at = NOW()
        WHERE id = $1`,
      [providerId],
    );
  }

  async decrementSubscriberCount(providerId) {
    await this.db.query(
      `UPDATE providers
          SET subscriber_count = GREATEST(0, subscriber_count - 1),
              updated_at = NOW()
        WHERE id = $1`,
      [providerId],
    );
  }

  async countByStatus() {
    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM providers
        GROUP BY status`,
    );
    return result.rows;
  }

  async countByCertificationStatus() {
    const result = await this.db.query(
      `SELECT certification_status, COUNT(*)::int AS count
         FROM providers
        GROUP BY certification_status`,
    );
    return result.rows;
  }

  async createCertification(data) {
    const result = await this.db.query(
      `INSERT INTO provider_certifications (
         provider_id, user_id, status, version, tier, parsing_accuracy,
         management_accuracy, quality_score, risk_score, consistency_score,
         historical_messages_imported, signals_detected, signals_validated,
         recommendation, certified_by, certified_at, expires_at, failed_at,
         failure_reason, revoked_at, revocation_reason, details, metadata,
         started_at, completed_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
         $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, NOW(), NOW()
       )
       RETURNING id, provider_id, status, version, tier, certified_at, expires_at,
                 started_at, completed_at, created_at`,
      [
        data.providerId,
        data.userId,
        data.status || 'PENDING',
        data.version || '1.0.0',
        data.tier || null,
        data.parsingAccuracy ?? null,
        data.managementAccuracy ?? null,
        data.qualityScore ?? null,
        data.riskScore ?? null,
        data.consistencyScore ?? null,
        data.historicalMessagesImported ?? 0,
        data.signalsDetected ?? 0,
        data.signalsValidated ?? 0,
        data.recommendation || null,
        data.certifiedBy || null,
        data.certifiedAt || null,
        data.expiresAt || null,
        data.failedAt || null,
        data.failureReason || null,
        data.revokedAt || null,
        data.revocationReason || null,
        data.details ? JSON.stringify(data.details) : null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.startedAt || null,
        data.completedAt || null,
      ],
    );
    return result.rows[0];
  }

  async findCertificationById(certificationId) {
    const result = await this.db.query(
      `SELECT id, provider_id, user_id, status, version, tier, parsing_accuracy,
              management_accuracy, quality_score, risk_score, consistency_score,
              historical_messages_imported, signals_detected, signals_validated,
              recommendation, certified_by, certified_at, expires_at, failed_at,
              failure_reason, revoked_at, revocation_reason, details, metadata,
              started_at, completed_at, created_at, updated_at
         FROM provider_certifications
        WHERE id = $1
        LIMIT 1`,
      [certificationId],
    );
    return result.rows[0] || null;
  }

  async findLatestCertification(providerId) {
    const result = await this.db.query(
      `SELECT id, provider_id, user_id, status, version, tier, parsing_accuracy,
              management_accuracy, quality_score, risk_score, consistency_score,
              historical_messages_imported, signals_detected, signals_validated,
              recommendation, certified_by, certified_at, expires_at,
              started_at, completed_at, created_at, updated_at
         FROM provider_certifications
        WHERE provider_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [providerId],
    );
    return result.rows[0] || null;
  }

  async listCertifications(providerId, pagination = {}) {
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, provider_id, status, version, tier, parsing_accuracy,
              management_accuracy, quality_score, risk_score, consistency_score,
              certified_at, expires_at, created_at
         FROM provider_certifications
        WHERE provider_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
      [providerId, limit, offset],
    );
    return { certifications: result.rows, limit, offset };
  }

  async updateCertification(certificationId, data) {
    const fields = [];
    const values = [certificationId];
    let index = 2;

    const mapping = {
      status: 'status',
      tier: 'tier',
      parsingAccuracy: 'parsing_accuracy',
      managementAccuracy: 'management_accuracy',
      qualityScore: 'quality_score',
      riskScore: 'risk_score',
      consistencyScore: 'consistency_score',
      historicalMessagesImported: 'historical_messages_imported',
      signalsDetected: 'signals_detected',
      signalsValidated: 'signals_validated',
      recommendation: 'recommendation',
      certifiedBy: 'certified_by',
      certifiedAt: 'certified_at',
      expiresAt: 'expires_at',
      failedAt: 'failed_at',
      failureReason: 'failure_reason',
      revokedAt: 'revoked_at',
      revocationReason: 'revocation_reason',
      startedAt: 'started_at',
      completedAt: 'completed_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.details !== undefined) {
      fields.push(`details = $${index++}`);
      values.push(data.details ? JSON.stringify(data.details) : null);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findCertificationById(certificationId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE provider_certifications SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findCertificationById(certificationId);
  }

  async findExpiredCertifications(referenceTime = new Date()) {
    const result = await this.db.query(
      `SELECT id, provider_id, user_id, status, expires_at
         FROM provider_certifications
        WHERE status IN ('CERTIFIED', 'CONDITIONALLY_CERTIFIED')
          AND expires_at IS NOT NULL
          AND expires_at <= $1`,
      [referenceTime],
    );
    return result.rows;
  }

  async createRevenueRecord(data) {
    const result = await this.db.query(
      `INSERT INTO provider_revenue (
         provider_id, user_id, period, gross_revenue, platform_fee,
         net_revenue, subscriber_count, currency, status, metadata,
         recorded_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
       ON CONFLICT (provider_id, period) DO UPDATE
       SET gross_revenue = EXCLUDED.gross_revenue,
           platform_fee = EXCLUDED.platform_fee,
           net_revenue = EXCLUDED.net_revenue,
           subscriber_count = EXCLUDED.subscriber_count,
           updated_at = NOW()
       RETURNING id, provider_id, period, gross_revenue, net_revenue, created_at`,
      [
        data.providerId,
        data.userId,
        data.period,
        data.grossRevenue ?? 0,
        data.platformFee ?? 0,
        data.netRevenue ?? 0,
        data.subscriberCount ?? 0,
        data.currency || 'USD',
        data.status || 'FINALIZED',
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async listRevenue(providerId, filters = {}, pagination = {}) {
    const conditions = ['provider_id = $1'];
    const values = [providerId];
    let index = 2;

    if (filters.fromPeriod) {
      conditions.push(`period >= $${index++}`);
      values.push(filters.fromPeriod);
    }
    if (filters.toPeriod) {
      conditions.push(`period <= $${index++}`);
      values.push(filters.toPeriod);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, provider_id, period, gross_revenue, platform_fee, net_revenue,
              subscriber_count, currency, status, recorded_at, created_at
         FROM provider_revenue
         ${where}
        ORDER BY period DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { records: result.rows, limit, offset };
  }

  async sumRevenue(providerId, filters = {}) {
    const conditions = ['provider_id = $1'];
    const values = [providerId];
    let index = 2;

    if (filters.fromPeriod) {
      conditions.push(`period >= $${index++}`);
      values.push(filters.fromPeriod);
    }
    if (filters.toPeriod) {
      conditions.push(`period <= $${index++}`);
      values.push(filters.toPeriod);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT
         COALESCE(SUM(gross_revenue), 0)::numeric AS gross,
         COALESCE(SUM(platform_fee), 0)::numeric AS fees,
         COALESCE(SUM(net_revenue), 0)::numeric AS net,
         COUNT(*)::int AS period_count
         FROM provider_revenue
         ${where}`,
      values,
    );
    const row = result.rows[0] || {};
    return {
      gross: Number(row.gross || 0),
      platformFees: Number(row.fees || 0),
      net: Number(row.net || 0),
      periodCount: row.period_count || 0,
    };
  }

  async createPromotion(data) {
    const result = await this.db.query(
      `INSERT INTO provider_promotions (
         provider_id, user_id, name, description, promotion_type, value,
         target_plans, max_uses, used_count, status, starts_at, ends_at,
         metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING id, provider_id, name, promotion_type, value, status,
                 starts_at, ends_at, created_at`,
      [
        data.providerId,
        data.userId,
        data.name,
        data.description || null,
        data.promotionType,
        data.value ?? null,
        data.targetPlans || [],
        data.maxUses ?? null,
        data.usedCount ?? 0,
        data.status || 'DRAFT',
        data.startsAt || null,
        data.endsAt || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findPromotionById(promotionId) {
    const result = await this.db.query(
      `SELECT id, provider_id, user_id, name, description, promotion_type,
              value, target_plans, max_uses, used_count, status, starts_at,
              ends_at, metadata, created_at, updated_at
         FROM provider_promotions
        WHERE id = $1
        LIMIT 1`,
      [promotionId],
    );
    return result.rows[0] || null;
  }

  async listPromotions(providerId, filters = {}, pagination = {}) {
    const conditions = ['provider_id = $1'];
    const values = [providerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, provider_id, name, description, promotion_type, value,
              target_plans, max_uses, used_count, status, starts_at, ends_at,
              created_at, updated_at
         FROM provider_promotions
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { promotions: result.rows, limit, offset };
  }

  async updatePromotion(promotionId, data) {
    const fields = [];
    const values = [promotionId];
    let index = 2;

    const mapping = {
      name: 'name',
      description: 'description',
      promotionType: 'promotion_type',
      value: 'value',
      maxUses: 'max_uses',
      usedCount: 'used_count',
      status: 'status',
      startsAt: 'starts_at',
      endsAt: 'ends_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.targetPlans !== undefined) {
      fields.push(`target_plans = $${index++}`);
      values.push(data.targetPlans);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return this.findPromotionById(promotionId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE provider_promotions SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findPromotionById(promotionId);
  }

  async deletePromotion(promotionId) {
    await this.db.query('DELETE FROM provider_promotions WHERE id = $1', [promotionId]);
  }

  async createSubscriber(data) {
    const result = await this.db.query(
      `INSERT INTO provider_subscribers (
         provider_id, subscriber_id, subscription_id, status,
         joined_at, left_at, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, NOW(), NOW())
       ON CONFLICT (provider_id, subscriber_id) DO NOTHING
       RETURNING id, provider_id, subscriber_id, status, joined_at`,
      [
        data.providerId,
        data.subscriberId,
        data.subscriptionId || null,
        data.status || 'ACTIVE',
        data.leftAt || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findSubscriber(providerId, subscriberId) {
    const result = await this.db.query(
      `SELECT id, provider_id, subscriber_id, subscription_id, status,
              joined_at, left_at, created_at, updated_at
         FROM provider_subscribers
        WHERE provider_id = $1 AND subscriber_id = $2
        LIMIT 1`,
      [providerId, subscriberId],
    );
    return result.rows[0] || null;
  }

  async listSubscribers(providerId, filters = {}, pagination = {}) {
    const conditions = ['provider_id = $1'];
    const values = [providerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, provider_id, subscriber_id, subscription_id, status,
              joined_at, left_at
         FROM provider_subscribers
         ${where}
        ORDER BY joined_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { subscribers: result.rows, limit, offset };
  }

  async updateSubscriber(subscriberId, data) {
    const fields = [];
    const values = [subscriberId];
    let index = 2;

    if (data.status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(data.status);
    }
    if (data.leftAt !== undefined) {
      fields.push(`left_at = $${index++}`);
      values.push(data.leftAt);
    }
    if (data.metadata !== undefined) {
      fields.push(`metadata = $${index++}`);
      values.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE provider_subscribers SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
  }
}

export default ProviderRepository;
/**
 * Affiliate Repository
 *
 * @module signalforge/server/modules/affiliate/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class AffiliateRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createPartner(data) {
    const result = await this.db.query(
      `INSERT INTO affiliate_partners (
         user_id, display_name, slug, bio, tier, status, commission_rate,
         commission_duration_months, payout_method, payout_details,
         country, website_url, social_links, tags, metadata, approved_at,
         suspended_at, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
         $16, $17, NOW(), NOW()
       )
       ON CONFLICT (user_id) DO NOTHING
       RETURNING id, user_id, display_name, slug, tier, status, commission_rate,
                 created_at`,
      [
        data.userId,
        data.displayName,
        data.slug,
        data.bio || null,
        data.tier || 'STANDARD',
        data.status || 'PENDING',
        data.commissionRate ?? 0.2,
        data.commissionDurationMonths ?? 12,
        data.payoutMethod || null,
        data.payoutDetails ? JSON.stringify(data.payoutDetails) : null,
        data.country || null,
        data.websiteUrl || null,
        data.socialLinks ? JSON.stringify(data.socialLinks) : null,
        data.tags || [],
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.approvedAt || null,
        data.suspendedAt || null,
      ],
    );
    return result.rows[0] || null;
  }

  async findPartnerById(partnerId) {
    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, tier, status, commission_rate,
              commission_duration_months, payout_method, payout_details, country,
              website_url, social_links, tags, total_referrals, active_referrals,
              total_commissions, pending_commissions, paid_commissions, metadata,
              approved_at, suspended_at, created_at, updated_at
         FROM affiliate_partners
        WHERE id = $1
        LIMIT 1`,
      [partnerId],
    );
    return result.rows[0] || null;
  }

  async findPartnerByUserId(userId) {
    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, bio, tier, status, commission_rate,
              commission_duration_months, total_referrals, active_referrals,
              total_commissions, pending_commissions, paid_commissions,
              created_at, updated_at
         FROM affiliate_partners
        WHERE user_id = $1
        LIMIT 1`,
      [userId],
    );
    return result.rows[0] || null;
  }

  async findPartnerBySlug(slug) {
    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, tier, status, commission_rate,
              total_referrals, active_referrals, total_commissions,
              created_at, updated_at
         FROM affiliate_partners
        WHERE slug = $1
        LIMIT 1`,
      [slug],
    );
    return result.rows[0] || null;
  }

  async listPartners(filters = {}, pagination = {}) {
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

    if (filters.tier) {
      conditions.push(`tier = $${index++}`);
      values.push(filters.tier);
    }

    if (filters.search) {
      conditions.push(
        `(display_name ILIKE $${index} OR slug ILIKE $${index} OR bio ILIKE $${index})`,
      );
      values.push(`%${filters.search}%`);
      index++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM affiliate_partners ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, user_id, display_name, slug, tier, status, commission_rate,
              total_referrals, active_referrals, total_commissions,
              pending_commissions, paid_commissions, created_at
         FROM affiliate_partners
         ${where}
        ORDER BY total_commissions DESC NULLS LAST, created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { partners: result.rows, total, limit, offset };
  }

  async updatePartner(partnerId, data) {
    const fields = [];
    const values = [partnerId];
    let index = 2;

    const mapping = {
      displayName: 'display_name',
      slug: 'slug',
      bio: 'bio',
      tier: 'tier',
      status: 'status',
      commissionRate: 'commission_rate',
      commissionDurationMonths: 'commission_duration_months',
      payoutMethod: 'payout_method',
      country: 'country',
      websiteUrl: 'website_url',
      totalReferrals: 'total_referrals',
      activeReferrals: 'active_referrals',
      totalCommissions: 'total_commissions',
      pendingCommissions: 'pending_commissions',
      paidCommissions: 'paid_commissions',
      approvedAt: 'approved_at',
      suspendedAt: 'suspended_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    if (data.payoutDetails !== undefined) {
      fields.push(`payout_details = $${index++}`);
      values.push(data.payoutDetails ? JSON.stringify(data.payoutDetails) : null);
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
      return this.findPartnerById(partnerId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE affiliate_partners SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findPartnerById(partnerId);
  }

  async deletePartner(partnerId) {
    await this.db.query('DELETE FROM affiliate_partners WHERE id = $1', [partnerId]);
  }

  async createLink(data) {
    const result = await this.db.query(
      `INSERT INTO affiliate_links (
         partner_id, user_id, code, name, description, link_type,
         target_url, target_id, utm_source, utm_medium, utm_campaign,
         click_count, conversion_count, status, expires_at, metadata,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
         $16, NOW(), NOW()
       )
       ON CONFLICT (code) DO NOTHING
       RETURNING id, partner_id, user_id, code, name, link_type, status, created_at`,
      [
        data.partnerId,
        data.userId,
        data.code,
        data.name,
        data.description || null,
        data.linkType || 'SIGNUP',
        data.targetUrl || null,
        data.targetId || null,
        data.utmSource || null,
        data.utmMedium || null,
        data.utmCampaign || null,
        data.clickCount ?? 0,
        data.conversionCount ?? 0,
        data.status || 'ACTIVE',
        data.expiresAt || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findLinkById(linkId) {
    const result = await this.db.query(
      `SELECT id, partner_id, user_id, code, name, description, link_type,
              target_url, target_id, utm_source, utm_medium, utm_campaign,
              click_count, conversion_count, status, expires_at, metadata,
              created_at, updated_at
         FROM affiliate_links
        WHERE id = $1
        LIMIT 1`,
      [linkId],
    );
    return result.rows[0] || null;
  }

  async findLinkByCode(code) {
    const result = await this.db.query(
      `SELECT id, partner_id, user_id, code, name, description, link_type,
              target_url, target_id, utm_source, utm_medium, utm_campaign,
              click_count, conversion_count, status, expires_at, metadata,
              created_at, updated_at
         FROM affiliate_links
        WHERE code = $1
        LIMIT 1`,
      [code],
    );
    return result.rows[0] || null;
  }

  async listLinks(partnerId, filters = {}, pagination = {}) {
    const conditions = ['partner_id = $1'];
    const values = [partnerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.linkType) {
      conditions.push(`link_type = $${index++}`);
      values.push(filters.linkType);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const result = await this.db.query(
      `SELECT id, partner_id, user_id, code, name, description, link_type,
              target_url, target_id, click_count, conversion_count, status,
              expires_at, created_at, updated_at
         FROM affiliate_links
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { links: result.rows, limit, offset };
  }

  async updateLink(linkId, data) {
    const fields = [];
    const values = [linkId];
    let index = 2;

    const mapping = {
      name: 'name',
      description: 'description',
      linkType: 'link_type',
      targetUrl: 'target_url',
      targetId: 'target_id',
      utmSource: 'utm_source',
      utmMedium: 'utm_medium',
      utmCampaign: 'utm_campaign',
      clickCount: 'click_count',
      conversionCount: 'conversion_count',
      status: 'status',
      expiresAt: 'expires_at',
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
      return this.findLinkById(linkId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE affiliate_links SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findLinkById(linkId);
  }

  async deleteLink(linkId) {
    await this.db.query('DELETE FROM affiliate_links WHERE id = $1', [linkId]);
  }

  async incrementLinkClick(linkId) {
    await this.db.query(
      `UPDATE affiliate_links
          SET click_count = click_count + 1,
              updated_at = NOW()
        WHERE id = $1`,
      [linkId],
    );
  }

  async incrementLinkConversion(linkId) {
    await this.db.query(
      `UPDATE affiliate_links
          SET conversion_count = conversion_count + 1,
              updated_at = NOW()
        WHERE id = $1`,
      [linkId],
    );
  }

  async createReferral(data) {
    const result = await this.db.query(
      `INSERT INTO affiliate_referrals (
         partner_id, link_id, referred_user_id, status, attribution_source,
         ip_address, user_agent, attributed_at, converted_at, expires_at,
         metadata, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, NOW(), NOW()
       )
       ON CONFLICT (referred_user_id) DO NOTHING
       RETURNING id, partner_id, link_id, referred_user_id, status, attributed_at, created_at`,
      [
        data.partnerId,
        data.linkId || null,
        data.referredUserId,
        data.status || 'ATTRIBUTED',
        data.attributionSource || null,
        data.ipAddress || null,
        data.userAgent || null,
        data.convertedAt || null,
        data.expiresAt || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findReferralById(referralId) {
    const result = await this.db.query(
      `SELECT id, partner_id, link_id, referred_user_id, status, attribution_source,
              ip_address, user_agent, attributed_at, converted_at, expires_at,
              metadata, created_at, updated_at
         FROM affiliate_referrals
        WHERE id = $1
        LIMIT 1`,
      [referralId],
    );
    return result.rows[0] || null;
  }

  async findReferralByReferredUser(referredUserId) {
    const result = await this.db.query(
      `SELECT id, partner_id, link_id, referred_user_id, status, attributed_at,
              converted_at, expires_at, created_at, updated_at
         FROM affiliate_referrals
        WHERE referred_user_id = $1
        LIMIT 1`,
      [referredUserId],
    );
    return result.rows[0] || null;
  }

  async listReferrals(partnerId, filters = {}, pagination = {}) {
    const conditions = ['partner_id = $1'];
    const values = [partnerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.since) {
      conditions.push(`attributed_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM affiliate_referrals ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, partner_id, link_id, referred_user_id, status,
              attribution_source, attributed_at, converted_at, expires_at
         FROM affiliate_referrals
         ${where}
        ORDER BY attributed_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { referrals: result.rows, total, limit, offset };
  }

  async updateReferral(referralId, data) {
    const fields = [];
    const values = [referralId];
    let index = 2;

    const mapping = {
      status: 'status',
      convertedAt: 'converted_at',
      expiresAt: 'expires_at',
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
      return this.findReferralById(referralId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE affiliate_referrals SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findReferralById(referralId);
  }

  async createCommission(data) {
    const result = await this.db.query(
      `INSERT INTO affiliate_commissions (
         partner_id, referral_id, referred_user_id, payment_id, subscription_id,
         commission_type, period, base_amount, commission_rate, commission_amount,
         currency, status, approved_at, paid_at, rejected_at, rejection_reason,
         reversal_reason, ledger_entry_id, metadata, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         $17, $18, $19, NOW(), NOW()
       )
       RETURNING id, partner_id, referral_id, commission_type, period,
                 commission_amount, status, created_at`,
      [
        data.partnerId,
        data.referralId || null,
        data.referredUserId,
        data.paymentId || null,
        data.subscriptionId || null,
        data.commissionType || 'REVENUE_SHARE',
        data.period || null,
        data.baseAmount ?? 0,
        data.commissionRate ?? 0,
        data.commissionAmount ?? 0,
        data.currency || 'USD',
        data.status || 'PENDING',
        data.approvedAt || null,
        data.paidAt || null,
        data.rejectedAt || null,
        data.rejectionReason || null,
        data.reversalReason || null,
        data.ledgerEntryId || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findCommissionById(commissionId) {
    const result = await this.db.query(
      `SELECT id, partner_id, referral_id, referred_user_id, payment_id,
              subscription_id, commission_type, period, base_amount,
              commission_rate, commission_amount, currency, status, approved_at,
              paid_at, rejected_at, rejection_reason, reversal_reason,
              ledger_entry_id, metadata, created_at, updated_at
         FROM affiliate_commissions
        WHERE id = $1
        LIMIT 1`,
      [commissionId],
    );
    return result.rows[0] || null;
  }

  async findCommissionByKey(partnerId, referredUserId, period, paymentId = null) {
    const values = [partnerId, referredUserId, period];
    let query = `
      SELECT id, partner_id, referral_id, referred_user_id, payment_id,
              commission_type, period, commission_amount, status, created_at
        FROM affiliate_commissions
       WHERE partner_id = $1
         AND referred_user_id = $2
         AND period = $3
    `;
    if (paymentId) {
      query += ` AND payment_id = $4`;
      values.push(paymentId);
    }
    query += ` LIMIT 1`;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async listCommissions(partnerId, filters = {}, pagination = {}) {
    const conditions = ['partner_id = $1'];
    const values = [partnerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.commissionType) {
      conditions.push(`commission_type = $${index++}`);
      values.push(filters.commissionType);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM affiliate_commissions ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, partner_id, referral_id, referred_user_id, payment_id,
              commission_type, period, base_amount, commission_rate,
              commission_amount, currency, status, approved_at, paid_at, created_at
         FROM affiliate_commissions
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { commissions: result.rows, total, limit, offset };
  }

  async updateCommission(commissionId, data) {
    const fields = [];
    const values = [commissionId];
    let index = 2;

    const mapping = {
      status: 'status',
      approvedAt: 'approved_at',
      paidAt: 'paid_at',
      rejectedAt: 'rejected_at',
      rejectionReason: 'rejection_reason',
      reversalReason: 'reversal_reason',
      ledgerEntryId: 'ledger_entry_id',
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
      return this.findCommissionById(commissionId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE affiliate_commissions SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findCommissionById(commissionId);
  }

  async sumCommissions(partnerId, filters = {}) {
    const conditions = ['partner_id = $1'];
    const values = [partnerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }
    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await this.db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'PENDING' THEN commission_amount ELSE 0 END), 0)::numeric AS pending,
         COALESCE(SUM(CASE WHEN status = 'CALCULATED' THEN commission_amount ELSE 0 END), 0)::numeric AS calculated,
         COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN commission_amount ELSE 0 END), 0)::numeric AS approved,
         COALESCE(SUM(CASE WHEN status = 'PAID' THEN commission_amount ELSE 0 END), 0)::numeric AS paid,
         COALESCE(SUM(CASE WHEN status = 'REVERSED' THEN commission_amount ELSE 0 END), 0)::numeric AS reversed,
         COUNT(*)::int AS count
         FROM affiliate_commissions
         ${where}`,
      values,
    );
    const row = result.rows[0] || {};
    return {
      pending: Number(row.pending || 0),
      calculated: Number(row.calculated || 0),
      approved: Number(row.approved || 0),
      paid: Number(row.paid || 0),
      reversed: Number(row.reversed || 0),
      count: row.count || 0,
    };
  }

  async createPayout(data) {
    const result = await this.db.query(
      `INSERT INTO affiliate_payouts (
         partner_id, user_id, amount, currency, status, method, destination,
         external_reference, requested_at, reviewed_by, reviewed_at,
         processed_at, completed_at, failure_reason, metadata,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12, $13, $14,
         NOW(), NOW()
       )
       RETURNING id, partner_id, user_id, amount, currency, status, requested_at, created_at`,
      [
        data.partnerId,
        data.userId,
        data.amount,
        data.currency || 'USD',
        data.status || 'PENDING',
        data.method || null,
        data.destination ? JSON.stringify(data.destination) : null,
        data.externalReference || null,
        data.reviewedBy || null,
        data.reviewedAt || null,
        data.processedAt || null,
        data.completedAt || null,
        data.failureReason || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0];
  }

  async findPayoutById(payoutId) {
    const result = await this.db.query(
      `SELECT id, partner_id, user_id, amount, currency, status, method,
              destination, external_reference, requested_at, reviewed_by,
              reviewed_at, processed_at, completed_at, failure_reason,
              metadata, created_at, updated_at
         FROM affiliate_payouts
        WHERE id = $1
        LIMIT 1`,
      [payoutId],
    );
    return result.rows[0] || null;
  }

  async listPayouts(partnerId, filters = {}, pagination = {}) {
    const conditions = ['partner_id = $1'];
    const values = [partnerId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM affiliate_payouts ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, partner_id, user_id, amount, currency, status, method,
              external_reference, requested_at, processed_at, completed_at,
              failure_reason, created_at, updated_at
         FROM affiliate_payouts
         ${where}
        ORDER BY requested_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { payouts: result.rows, total, limit, offset };
  }

  async updatePayout(payoutId, data) {
    const fields = [];
    const values = [payoutId];
    let index = 2;

    const mapping = {
      status: 'status',
      externalReference: 'external_reference',
      reviewedBy: 'reviewed_by',
      reviewedAt: 'reviewed_at',
      processedAt: 'processed_at',
      completedAt: 'completed_at',
      failureReason: 'failure_reason',
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
      return this.findPayoutById(payoutId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE affiliate_payouts SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findPayoutById(payoutId);
  }

  async recomputePartnerCounters(partnerId) {
    const referralResult = await this.db.query(
      `SELECT
         COUNT(*)::int AS total,
         COALESCE(SUM(CASE WHEN status = 'ACTIVE' OR status = 'CONVERTED' THEN 1 ELSE 0 END), 0)::int AS active
         FROM affiliate_referrals
        WHERE partner_id = $1`,
      [partnerId],
    );
    const commissionResult = await this.db.query(
      `SELECT
         COALESCE(SUM(commission_amount), 0)::numeric AS total,
         COALESCE(SUM(CASE WHEN status IN ('PENDING','CALCULATED','APPROVED') THEN commission_amount ELSE 0 END), 0)::numeric AS pending,
         COALESCE(SUM(CASE WHEN status = 'PAID' THEN commission_amount ELSE 0 END), 0)::numeric AS paid
         FROM affiliate_commissions
        WHERE partner_id = $1`,
      [partnerId],
    );

    const totalReferrals = referralResult.rows[0]?.total || 0;
    const activeReferrals = referralResult.rows[0]?.active || 0;
    const totalCommissions = Number(commissionResult.rows[0]?.total || 0);
    const pendingCommissions = Number(commissionResult.rows[0]?.pending || 0);
    const paidCommissions = Number(commissionResult.rows[0]?.paid || 0);

    await this.updatePartner(partnerId, {
      totalReferrals,
      activeReferrals,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
    });

    return {
      totalReferrals,
      activeReferrals,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
    };
  }

  async countPartnersByStatus() {
    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM affiliate_partners
        GROUP BY status`,
    );
    return result.rows;
  }

  async sumAllCommissions(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.since) {
      conditions.push(`created_at >= $${index++}`);
      values.push(filters.since);
    }

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT
         COALESCE(SUM(commission_amount), 0)::numeric AS total,
         COUNT(*)::int AS count
         FROM affiliate_commissions
         ${where}`,
      values,
    );
    const row = result.rows[0] || {};
    return {
      total: Number(row.total || 0),
      count: row.count || 0,
    };
  }
}

export default AffiliateRepository;
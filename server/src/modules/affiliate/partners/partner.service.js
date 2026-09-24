/**
 * Affiliate Partner Service
 *
 * @module signalforge/server/modules/affiliate/partners/service
 */

import { AffiliatePartnerRepository } from './repository.js';
import {
  AFFILIATE_PARTNER_STATUSES,
  AFFILIATE_TIERS,
  AFFILIATE_TIER_RATES,
  DEFAULT_AFFILIATE_COMMISSION_RATE,
  DEFAULT_AFFILIATE_COMMISSION_DURATION_MONTHS,
} from '../affiliate.constants.js';
import {
  AffiliatePartnerNotFoundError,
  AffiliatePartnerAlreadyExistsError,
  AffiliatePartnerNotActiveError,
} from '../affiliate.errors.js';
import {
  emitPartnerRegistered,
  emitPartnerUpdated,
  emitPartnerApproved,
  emitPartnerSuspended,
  emitPartnerReinstated,
} from '../affiliate.events.js';

export class AffiliatePartnerService {
  constructor(repository = null) {
    this.repository = repository || new AffiliatePartnerRepository();
  }

  async register(userId, payload) {
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      throw new AffiliatePartnerAlreadyExistsError();
    }

    const slug = payload.slug || this.generateSlug(payload.displayName);
    const tier = payload.tier || AFFILIATE_TIERS.STANDARD;
    const commissionRate =
      payload.commissionRate ?? AFFILIATE_TIER_RATES[tier] ?? DEFAULT_AFFILIATE_COMMISSION_RATE;

    const created = await this.repository.create({
      userId,
      displayName: payload.displayName,
      slug,
      bio: payload.bio || null,
      tier,
      status: AFFILIATE_PARTNER_STATUSES.PENDING,
      commissionRate,
      commissionDurationMonths:
        payload.commissionDurationMonths ?? DEFAULT_AFFILIATE_COMMISSION_DURATION_MONTHS,
      payoutMethod: payload.payoutMethod || null,
      payoutDetails: payload.payoutDetails || null,
      country: payload.country || null,
      websiteUrl: payload.websiteUrl || null,
      socialLinks: payload.socialLinks || null,
      tags: payload.tags || [],
      metadata: payload.metadata || null,
    });

    if (!created) {
      throw new AffiliatePartnerAlreadyExistsError();
    }

    await emitPartnerRegistered(created.id, userId);

    return this.getById(created.id);
  }

  generateSlug(displayName) {
    const base = String(displayName || 'partner')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base || 'partner'}-${suffix}`;
  }

  async getById(partnerId) {
    const partner = await this.repository.findById(partnerId);
    if (!partner) {
      throw new AffiliatePartnerNotFoundError();
    }
    return this.serialize(partner);
  }

  async getByUserId(userId) {
    const partner = await this.repository.findByUserId(userId);
    return this.serialize(partner);
  }

  async getBySlug(slug) {
    const partner = await this.repository.findBySlug(slug);
    if (!partner) {
      throw new AffiliatePartnerNotFoundError();
    }
    return this.serialize(partner);
  }

  async listPartners(filters = {}, pagination = {}) {
    const result = await this.repository.list(filters, pagination);
    return {
      partners: result.partners.map((p) => this.serialize(p)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async update(partnerId, payload) {
    const partner = await this.repository.findById(partnerId);
    if (!partner) {
      throw new AffiliatePartnerNotFoundError();
    }
    await this.repository.update(partnerId, payload);
    const updated = await this.repository.findById(partnerId);
    await emitPartnerUpdated(partnerId, Object.keys(payload));
    return this.serialize(updated);
  }

  async approve(partnerId, actorId) {
    const partner = await this.repository.findById(partnerId);
    if (!partner) {
      throw new AffiliatePartnerNotFoundError();
    }
    await this.repository.update(partnerId, {
      status: AFFILIATE_PARTNER_STATUSES.APPROVED,
      approvedAt: new Date(),
    });
    await emitPartnerApproved(partnerId, actorId);
    const updated = await this.repository.findById(partnerId);
    return this.serialize(updated);
  }

  async suspend(partnerId, actorId, reason) {
    const partner = await this.repository.findById(partnerId);
    if (!partner) {
      throw new AffiliatePartnerNotFoundError();
    }
    await this.repository.update(partnerId, {
      status: AFFILIATE_PARTNER_STATUSES.SUSPENDED,
      suspendedAt: new Date(),
    });
    await emitPartnerSuspended(partnerId, actorId, reason);
    const updated = await this.repository.findById(partnerId);
    return this.serialize(updated);
  }

  async reinstate(partnerId, actorId) {
    const partner = await this.repository.findById(partnerId);
    if (!partner) {
      throw new AffiliatePartnerNotFoundError();
    }
    await this.repository.update(partnerId, {
      status: AFFILIATE_PARTNER_STATUSES.ACTIVE,
      suspendedAt: null,
    });
    await emitPartnerReinstated(partnerId, actorId);
    const updated = await this.repository.findById(partnerId);
    return this.serialize(updated);
  }

  async assertActive(partnerId) {
    const partner = await this.repository.findById(partnerId);
    if (!partner) {
      throw new AffiliatePartnerNotFoundError();
    }
    if (
      ![
        AFFILIATE_PARTNER_STATUSES.APPROVED,
        AFFILIATE_PARTNER_STATUSES.ACTIVE,
      ].includes(partner.status)
    ) {
      throw new AffiliatePartnerNotActiveError(undefined, { status: partner.status });
    }
    return partner;
  }

  async recomputeCounters(partnerId) {
    return this.repository.recomputeCounters(partnerId);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      displayName: row.display_name,
      slug: row.slug,
      bio: row.bio,
      tier: row.tier,
      status: row.status,
      commissionRate: row.commission_rate,
      commissionDurationMonths: row.commission_duration_months,
      payoutMethod: row.payout_method,
      payoutDetails: this.parseJson(row.payout_details),
      country: row.country,
      websiteUrl: row.website_url,
      socialLinks: this.parseJson(row.social_links),
      tags: row.tags,
      totalReferrals: row.total_referrals,
      activeReferrals: row.active_referrals,
      totalCommissions: row.total_commissions,
      pendingCommissions: row.pending_commissions,
      paidCommissions: row.paid_commissions,
      metadata: this.parseJson(row.metadata),
      approvedAt: row.approved_at,
      suspendedAt: row.suspended_at,
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

export default AffiliatePartnerService;
/**
 * Affiliate Link Service
 *
 * @module signalforge/server/modules/affiliate/links/service
 */

import crypto from 'node:crypto';

import { AffiliateLinkRepository } from './repository.js';
import { AffiliatePartnerService } from '../partners/service.js';
import {
  AffiliateLinkNotFoundError,
  AffiliateLinkAlreadyExistsError,
  AffiliatePartnerNotFoundError,
} from '../affiliate.errors.js';
import {
  emitLinkCreated,
  emitLinkUpdated,
  emitLinkDeleted,
} from '../affiliate.events.js';

const CODE_LENGTH = 8;

export class AffiliateLinkService {
  constructor(repository = null, partnerService = null) {
    this.repository = repository || new AffiliateLinkRepository();
    this.partners = partnerService || new AffiliatePartnerService();
  }

  generateCode() {
    return crypto
      .randomBytes(CODE_LENGTH)
      .toString('base64url')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, CODE_LENGTH);
  }

  async create(partnerId, userId, payload) {
    const partner = await this.partners.getById(partnerId);
    if (!partner) {
      throw new AffiliatePartnerNotFoundError();
    }
    if (partner.userId !== userId) {
      throw new AffiliatePartnerNotFoundError('Partner does not belong to this user');
    }

    const code = payload.code || this.generateCode();

    const created = await this.repository.create({
      partnerId,
      userId,
      code,
      name: payload.name,
      description: payload.description || null,
      linkType: payload.linkType || 'SIGNUP',
      targetUrl: payload.targetUrl || null,
      targetId: payload.targetId || null,
      utmSource: payload.utmSource || null,
      utmMedium: payload.utmMedium || null,
      utmCampaign: payload.utmCampaign || null,
      status: payload.status || 'ACTIVE',
      expiresAt: payload.expiresAt || null,
      metadata: payload.metadata || null,
    });

    if (!created) {
      throw new AffiliateLinkAlreadyExistsError();
    }

    await emitLinkCreated(created.id, partnerId, created.code);
    return this.getById(created.id);
  }

  async getById(linkId) {
    const link = await this.repository.findById(linkId);
    if (!link) {
      throw new AffiliateLinkNotFoundError();
    }
    return this.serialize(link);
  }

  async getByCode(code) {
    const link = await this.repository.findByCode(code);
    if (!link) {
      throw new AffiliateLinkNotFoundError();
    }
    return this.serialize(link);
  }

  async list(partnerId, filters = {}, pagination = {}) {
    const result = await this.repository.list(partnerId, filters, pagination);
    return {
      links: result.links.map((l) => this.serialize(l)),
      limit: result.limit,
      offset: result.offset,
    };
  }

  async update(partnerId, linkId, payload) {
    const link = await this.repository.findById(linkId);
    if (!link) {
      throw new AffiliateLinkNotFoundError();
    }
    if (link.partner_id !== partnerId) {
      throw new AffiliateLinkNotFoundError('Link does not belong to this partner');
    }
    await this.repository.update(linkId, payload);
    const updated = await this.repository.findById(linkId);
    await emitLinkUpdated(linkId, Object.keys(payload));
    return this.serialize(updated);
  }

  async remove(partnerId, linkId) {
    const link = await this.repository.findById(linkId);
    if (!link) {
      throw new AffiliateLinkNotFoundError();
    }
    if (link.partner_id !== partnerId) {
      throw new AffiliateLinkNotFoundError('Link does not belong to this partner');
    }
    await this.repository.delete(linkId);
    await emitLinkDeleted(linkId);
    return { deleted: true };
  }

  async recordClick(linkId) {
    await this.repository.incrementClick(linkId);
  }

  async recordConversion(linkId) {
    await this.repository.incrementConversion(linkId);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      partnerId: row.partner_id,
      userId: row.user_id,
      code: row.code,
      name: row.name,
      description: row.description,
      linkType: row.link_type,
      targetUrl: row.target_url,
      targetId: row.target_id,
      utmSource: row.utm_source,
      utmMedium: row.utm_medium,
      utmCampaign: row.utm_campaign,
      clickCount: row.click_count,
      conversionCount: row.conversion_count,
      status: row.status,
      expiresAt: row.expires_at,
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

export default AffiliateLinkService;
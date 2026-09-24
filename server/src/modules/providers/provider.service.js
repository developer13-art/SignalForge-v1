/**
 * Provider Service (facade)
 *
 * @module signalforge/server/modules/providers/service
 */

import { ProviderRepository } from './provider.repository.js';
import { ProviderProfileService } from './profile/service.js';
import { CertificationService } from './certification/service.js';
import { ProviderRevenueService } from './revenue/service.js';
import { ProviderSubscriberService } from './subscribers/service.js';
import { ProviderPromotionsService } from './business/promotions.js';
import { RevenueDashboardService } from './business/revenue-dashboard.service.js';
import { MarketingToolsService } from './business/marketing-tools.service.js';
import { ProviderSettingsService } from './business/provider-settings.service.js';
import {
  PROVIDER_STATUSES,
  CERTIFICATION_STATUSES,
} from './provider.constants.js';
import {
  ProviderNotFoundError,
  ProviderAlreadyRegisteredError,
  ProviderNotActiveError,
} from './provider.errors.js';
import {
  emitProviderRegistered,
  emitProviderUpdated,
  emitProviderApproved,
  emitProviderSuspended,
  emitProviderReinstated,
} from './provider.events.js';

export class ProviderService {
  constructor(dependencies = {}) {
    this.repository = dependencies.repository || new ProviderRepository();

    this.profile =
      dependencies.profile ||
      new ProviderProfileService(undefined, this.repository);

    this.certifications =
      dependencies.certifications ||
      new CertificationService({ providerRepository: this.repository });

    this.revenue =
      dependencies.revenue ||
      new ProviderRevenueService(dependencies.revenueRepository);

    this.subscribers =
      dependencies.subscribers ||
      new ProviderSubscriberService(dependencies.subscriberRepository);

    this.promotions =
      dependencies.promotions ||
      new ProviderPromotionsService(dependencies.promotionRepository);

    this.dashboard =
      dependencies.dashboard ||
      new RevenueDashboardService({
        revenue: this.revenue,
        subscribers: this.subscribers,
      });

    this.marketing = dependencies.marketing || new MarketingToolsService();
    this.settings = dependencies.settings || new ProviderSettingsService(this.repository);
  }

  async register(userId, payload) {
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      throw new ProviderAlreadyRegisteredError();
    }

    const slug = payload.slug || this.generateSlug(payload.displayName);

    const created = await this.repository.create({
      userId,
      displayName: payload.displayName,
      slug,
      bio: payload.bio || null,
      providerType: payload.providerType || 'SIGNAL_PROVIDER',
      visibility: payload.visibility || 'PUBLIC',
      language: payload.language || null,
      timezone: payload.timezone || null,
      websiteUrl: payload.websiteUrl || null,
      socialLinks: payload.socialLinks || null,
      tags: payload.tags || [],
      metadata: payload.metadata || null,
    });

    if (!created) {
      const found = await this.repository.findByUserId(userId);
      throw new ProviderAlreadyRegisteredError(undefined, { providerId: found?.id });
    }

    await emitProviderRegistered(created.id, userId);

    return this.getProviderById(created.id);
  }

  generateSlug(displayName) {
    const base = String(displayName || 'provider')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base || 'provider'}-${suffix}`;
  }

  async getProviderById(providerId) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    return this.serialize(provider);
  }

  async getProviderByUserId(userId) {
    const provider = await this.repository.findByUserId(userId);
    return this.serialize(provider);
  }

  async listProviders(filters = {}, pagination = {}) {
    const result = await this.repository.list(filters, pagination);
    return {
      providers: result.providers.map((p) => this.serialize(p)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async approve(providerId, actorId) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    await this.repository.update(providerId, {
      status: PROVIDER_STATUSES.APPROVED,
      approvedAt: new Date(),
    });
    await emitProviderApproved(providerId, actorId);
    const updated = await this.repository.findById(providerId);
    return this.serialize(updated);
  }

  async suspend(providerId, actorId, reason) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    await this.repository.update(providerId, {
      status: PROVIDER_STATUSES.SUSPENDED,
      suspendedAt: new Date(),
    });
    await emitProviderSuspended(providerId, actorId, reason);
    const updated = await this.repository.findById(providerId);
    return this.serialize(updated);
  }

  async reinstate(providerId, actorId) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    await this.repository.update(providerId, {
      status: PROVIDER_STATUSES.ACTIVE,
      suspendedAt: null,
    });
    await emitProviderReinstated(providerId, actorId);
    const updated = await this.repository.findById(providerId);
    return this.serialize(updated);
  }

  async assertActive(providerId) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    if (![PROVIDER_STATUSES.APPROVED, PROVIDER_STATUSES.ACTIVE].includes(provider.status)) {
      throw new ProviderNotActiveError(undefined, { status: provider.status });
    }
    return provider;
  }

  async isCertified(providerId) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      return false;
    }
    return [
      CERTIFICATION_STATUSES.CERTIFIED,
      CERTIFICATION_STATUSES.CONDITIONALLY_CERTIFIED,
    ].includes(provider.certification_status);
  }

  async countByStatus() {
    return this.repository.countByStatus();
  }

  async countByCertificationStatus() {
    return this.repository.countByCertificationStatus();
  }

  async updateProvider(providerId, payload) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    await this.repository.update(providerId, payload);
    const updated = await this.repository.findById(providerId);
    await emitProviderUpdated(providerId, Object.keys(payload));
    return this.serialize(updated);
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
      avatarUrl: row.avatar_url,
      providerType: row.provider_type,
      status: row.status,
      visibility: row.visibility,
      certificationStatus: row.certification_status,
      certificationVersion: row.certification_version,
      subscriberCount: row.subscriber_count,
      totalSignals: row.total_signals,
      validatedSignals: row.validated_signals,
      executedSignals: row.executed_signals,
      winningTrades: row.winning_trades,
      losingTrades: row.losing_trades,
      winRate: row.win_rate,
      averageRr: row.average_rr,
      consistencyScore: row.consistency_score,
      reputationScore: row.reputation_score,
      solanaAttestationId: row.solana_attestation_id,
      language: row.language,
      timezone: row.timezone,
      websiteUrl: row.website_url,
      socialLinks: this.parseJson(row.social_links),
      tags: row.tags,
      metadata: this.parseJson(row.metadata),
      suspendedAt: row.suspended_at,
      approvedAt: row.approved_at,
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

export default ProviderService;
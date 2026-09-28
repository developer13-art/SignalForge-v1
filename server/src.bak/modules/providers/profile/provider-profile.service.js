/**
 * Provider Profile Service
 *
 * @module signalforge/server/modules/providers/profile/service
 */

import { ProviderProfileRepository } from './repository.js';
import { ProviderRepository } from '../provider.repository.js';
import { ProviderNotFoundError, ProviderNotOwnedError } from '../provider.errors.js';
import {
  emitProviderProfileUpdated,
  emitProviderAvatarUpdated,
  emitProviderAvatarRemoved,
} from '../provider.events.js';

export class ProviderProfileService {
  constructor(repository = null, providerRepository = null) {
    this.repository = repository || new ProviderProfileRepository();
    this.providerRepository = providerRepository || new ProviderRepository();
  }

  async getProfile(providerId) {
    const row = await this.repository.findById(providerId);
    if (!row) {
      throw new ProviderNotFoundError();
    }
    return this.serialize(row);
  }

  async getProfileBySlug(slug) {
    const row = await this.repository.findBySlug(slug);
    if (!row) {
      throw new ProviderNotFoundError();
    }
    return this.serialize(row);
  }

  async getProfileByUserId(userId) {
    const row = await this.repository.findByUserId(userId);
    if (!row) {
      throw new ProviderNotFoundError();
    }
    return this.serialize(row);
  }

  async updateProfile(userId, providerId, payload) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    if (provider.user_id !== userId) {
      throw new ProviderNotOwnedError();
    }
    await this.repository.update(providerId, payload);
    const updated = await this.repository.findById(providerId);
    await emitProviderProfileUpdated(providerId, Object.keys(payload));
    return this.serialize(updated);
  }

  async updateAvatar(userId, providerId, avatarUrl) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    if (provider.user_id !== userId) {
      throw new ProviderNotOwnedError();
    }
    await this.repository.update(providerId, { avatarUrl });
    await emitProviderAvatarUpdated(providerId, avatarUrl);
    const updated = await this.repository.findById(providerId);
    return this.serialize(updated);
  }

  async removeAvatar(userId, providerId) {
    const provider = await this.repository.findById(providerId);
    if (!provider) {
      throw new ProviderNotFoundError();
    }
    if (provider.user_id !== userId) {
      throw new ProviderNotOwnedError();
    }
    await this.repository.update(providerId, { avatarUrl: null });
    await emitProviderAvatarRemoved(providerId);
    const updated = await this.repository.findById(providerId);
    return this.serialize(updated);
  }

  async listPublic(filters = {}, pagination = {}) {
    const result = await this.repository.list(
      {
        ...filters,
        status: ['APPROVED', 'ACTIVE'],
        visibility: 'PUBLIC',
      },
      pagination,
    );
    return {
      providers: result.providers.map((p) => this.serialize(p)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
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

export default ProviderProfileService;
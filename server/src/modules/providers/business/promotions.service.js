/**
 * Provider Promotions Service
 *
 * @module signalforge/server/modules/providers/business/promotions
 */

import { ProviderPromotionsRepository } from './promotions-repository.js';
import { PromotionNotFoundError, PromotionNotEditableError } from '../provider.errors.js';
import {
  PROMOTION_STATUSES,
} from '../provider.constants.js';
import {
  emitPromotionCreated,
  emitPromotionUpdated,
  emitPromotionDeleted,
} from '../provider.events.js';

export class ProviderPromotionsService {
  constructor(repository = null) {
    this.repository = repository || new ProviderPromotionsRepository();
  }

  async create(providerId, userId, payload) {
    const created = await this.repository.create({
      providerId,
      userId,
      name: payload.name,
      description: payload.description || null,
      promotionType: payload.promotionType,
      value: payload.value ?? null,
      targetPlans: payload.targetPlans || [],
      maxUses: payload.maxUses ?? null,
      usedCount: 0,
      status: payload.status || PROMOTION_STATUSES.DRAFT,
      startsAt: payload.startsAt || null,
      endsAt: payload.endsAt || null,
      metadata: payload.metadata || null,
    });

    await emitPromotionCreated(providerId, created.id);

    return this.serialize(created);
  }

  async getById(promotionId) {
    const row = await this.repository.findById(promotionId);
    if (!row) {
      throw new PromotionNotFoundError();
    }
    return this.serialize(row);
  }

  async list(providerId, filters = {}, pagination = {}) {
    const result = await this.repository.list(providerId, filters, pagination);
    return {
      promotions: result.promotions.map((p) => this.serialize(p)),
      limit: result.limit,
      offset: result.offset,
    };
  }

  async update(providerId, promotionId, payload) {
    const promotion = await this.repository.findById(promotionId);
    if (!promotion || promotion.provider_id !== providerId) {
      throw new PromotionNotFoundError();
    }
    if (promotion.status === PROMOTION_STATUSES.EXPIRED) {
      throw new PromotionNotEditableError(undefined, { status: promotion.status });
    }

    await this.repository.update(promotionId, payload);
    const updated = await this.repository.findById(promotionId);
    await emitPromotionUpdated(providerId, promotionId, Object.keys(payload));

    return this.serialize(updated);
  }

  async delete(providerId, promotionId) {
    const promotion = await this.repository.findById(promotionId);
    if (!promotion || promotion.provider_id !== providerId) {
      throw new PromotionNotFoundError();
    }
    await this.repository.delete(promotionId);
    await emitPromotionDeleted(providerId, promotionId);
    return { deleted: true };
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      providerId: row.provider_id,
      name: row.name,
      description: row.description,
      promotionType: row.promotion_type,
      value: row.value,
      targetPlans: row.target_plans,
      maxUses: row.max_uses,
      usedCount: row.used_count,
      status: row.status,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
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

export default ProviderPromotionsService;
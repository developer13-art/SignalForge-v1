/**
 * Category Service
 *
 * @module signalforge/server/modules/marketplace/discovery/category
 */

import { MarketplaceRepository } from '../marketplace.repository.js';
import {
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_CATEGORY_VALUES,
} from '../marketplace.constants.js';
import { CategoryNotFoundError } from '../marketplace.errors.js';
import {
  emitCategoryCreated,
  emitCategoryUpdated,
  emitCategoryDeleted,
} from '../marketplace.events.js';

const DEFAULT_LABELS = Object.freeze({
  [MARKETPLACE_CATEGORIES.FOREX]: 'Forex',
  [MARKETPLACE_CATEGORIES.CRYPTO]: 'Cryptocurrency',
  [MARKETPLACE_CATEGORIES.INDICES]: 'Indices',
  [MARKETPLACE_CATEGORIES.COMMODITIES]: 'Commodities',
  [MARKETPLACE_CATEGORIES.STOCKS]: 'Stocks',
  [MARKETPLACE_CATEGORIES.FUTURES]: 'Futures',
  [MARKETPLACE_CATEGORIES.OPTIONS]: 'Options',
  [MARKETPLACE_CATEGORIES.MIXED]: 'Mixed Assets',
  [MARKETPLACE_CATEGORIES.SCALPING]: 'Scalping',
  [MARKETPLACE_CATEGORIES.DAY_TRADING]: 'Day Trading',
  [MARKETPLACE_CATEGORIES.SWING_TRADING]: 'Swing Trading',
  [MARKETPLACE_CATEGORIES.POSITION_TRADING]: 'Position Trading',
  [MARKETPLACE_CATEGORIES.ALGO_TRADING]: 'Algorithmic Trading',
});

export class CategoryService {
  constructor(repository = null) {
    this.repository = repository || new MarketplaceRepository();
  }

  async listCategories(filters = {}) {
    const rows = await this.repository.listCategories(filters);
    return rows.map((row) => this.serialize(row));
  }

  async getByCode(code) {
    const category = await this.repository.findCategoryByCode(code);
    if (!category) {
      throw new CategoryNotFoundError();
    }
    return this.serialize(category);
  }

  async create(payload) {
    const created = await this.repository.createCategory({
      code: payload.code,
      label: payload.label,
      description: payload.description || null,
      iconUrl: payload.iconUrl || null,
      parentId: payload.parentId || null,
      displayOrder: payload.displayOrder ?? 100,
      isActive: payload.isActive !== false,
      metadata: payload.metadata || null,
    });

    await emitCategoryCreated(created.id, created.code);

    return this.serialize(created);
  }

  async update(categoryId, payload) {
    await this.repository.updateCategory(categoryId, payload);
    const categories = await this.repository.listCategories({});
    const updated = categories.find((c) => c.id === categoryId);
    if (!updated) {
      throw new CategoryNotFoundError();
    }
    await emitCategoryUpdated(categoryId, Object.keys(payload));
    return this.serialize(updated);
  }

  async delete(categoryId) {
    const categories = await this.repository.listCategories({});
    const existing = categories.find((c) => c.id === categoryId);
    if (!existing) {
      throw new CategoryNotFoundError();
    }
    await this.repository.deleteCategory(categoryId);
    await emitCategoryDeleted(categoryId, existing.code);
    return { deleted: true };
  }

  async getCategoryCounts() {
    return this.repository.countListingsByCategory();
  }

  listDefaultCategories() {
    return MARKETPLACE_CATEGORY_VALUES.map((code) => ({
      code,
      label: DEFAULT_LABELS[code] || code,
    }));
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      code: row.code,
      label: row.label,
      description: row.description,
      iconUrl: row.icon_url,
      parentId: row.parent_id,
      displayOrder: row.display_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default CategoryService;
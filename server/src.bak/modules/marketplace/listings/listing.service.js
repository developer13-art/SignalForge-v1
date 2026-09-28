/**
 * Listing Service
 *
 * @module signalforge/server/modules/marketplace/listings/service
 */

import { ListingRepository } from './repository.js';
import { ProviderRepository } from '../../providers/provider.repository.js';
import {
  LISTING_STATUSES,
  LISTING_VISIBILITY,
} from '../marketplace.constants.js';
import {
  ListingNotFoundError,
  ListingAlreadyExistsError,
  ListingNotOwnedError,
  ListingNotEditableError,
} from '../marketplace.errors.js';
import {
  emitListingCreated,
  emitListingUpdated,
  emitListingDeleted,
  emitListingPublished,
  emitListingUnpublished,
  emitListingFeatured,
  emitListingUnfeatured,
} from '../marketplace.events.js';

export class ListingService {
  constructor(repository = null, providerRepository = null) {
    this.repository = repository || new ListingRepository();
    this.providerRepository = providerRepository || new ProviderRepository();
  }

  async createForProvider(providerId, userId, payload) {
    const provider = await this.providerRepository.findById(providerId);
    if (!provider) {
      throw new ListingNotFoundError('Provider not found');
    }
    if (provider.user_id !== userId) {
      throw new ListingNotOwnedError();
    }

    const existing = await this.repository.findByProviderId(providerId);
    if (existing) {
      throw new ListingAlreadyExistsError();
    }

    const slug = payload.slug || this.generateSlug(payload.title);

    const created = await this.repository.create({
      providerId,
      userId,
      title: payload.title,
      slug,
      shortDescription: payload.shortDescription || null,
      description: payload.description || null,
      status: payload.status || LISTING_STATUSES.DRAFT,
      visibility: payload.visibility || LISTING_VISIBILITY.PUBLIC,
      categories: payload.categories || [],
      tags: payload.tags || [],
      price: payload.price ?? 0,
      currency: payload.currency || 'USD',
      billingInterval: payload.billingInterval || 'MONTHLY',
      trialDays: payload.trialDays ?? 7,
      coverImageUrl: payload.coverImageUrl || null,
      media: payload.media || null,
      highlights: payload.highlights || null,
      requirements: payload.requirements || null,
      featured: payload.featured === true,
      featuredUntil: payload.featuredUntil || null,
      displayOrder: payload.displayOrder ?? 100,
      metadata: payload.metadata || null,
    });

    if (!created) {
      throw new ListingAlreadyExistsError();
    }

    await emitListingCreated(created.id, providerId, userId, { slug });

    return this.getById(created.id);
  }

  generateSlug(title) {
    const base = String(title || 'listing')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base || 'listing'}-${suffix}`;
  }

  async getById(listingId) {
    const listing = await this.repository.findById(listingId);
    if (!listing) {
      throw new ListingNotFoundError();
    }
    return this.serialize(listing);
  }

  async getBySlug(slug) {
    const listing = await this.repository.findBySlug(slug);
    if (!listing) {
      throw new ListingNotFoundError();
    }
    return this.serialize(listing);
  }

  async getByProviderId(providerId) {
    const listing = await this.repository.findByProviderId(providerId);
    return this.serialize(listing);
  }

  async list(filters = {}, pagination = {}) {
    const result = await this.repository.list(filters, pagination);
    return {
      listings: result.listings.map((l) => this.serialize(l)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async listPublished(filters = {}, pagination = {}) {
    const result = await this.repository.list(
      {
        ...filters,
        status: LISTING_STATUSES.PUBLISHED,
        visibility: LISTING_VISIBILITY.PUBLIC,
      },
      pagination,
    );
    return {
      listings: result.listings.map((l) => this.serialize(l)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async listFeatured(limit = 20) {
    const rows = await this.repository.listFeatured(limit);
    return rows.map((l) => this.serialize(l));
  }

  async update(userId, listingId, payload) {
    const listing = await this.repository.findById(listingId);
    if (!listing) {
      throw new ListingNotFoundError();
    }
    if (listing.user_id !== userId) {
      throw new ListingNotOwnedError();
    }
    if (
      [
        LISTING_STATUSES.ARCHIVED,
        LISTING_STATUSES.SUSPENDED,
      ].includes(listing.status)
    ) {
      throw new ListingNotEditableError(undefined, { status: listing.status });
    }

    await this.repository.update(listingId, payload);
    const updated = await this.repository.findById(listingId);
    await emitListingUpdated(listingId, Object.keys(payload));
    return this.serialize(updated);
  }

  async publish(userId, listingId) {
    const listing = await this.repository.findById(listingId);
    if (!listing) {
      throw new ListingNotFoundError();
    }
    if (listing.user_id !== userId) {
      throw new ListingNotOwnedError();
    }

    await this.repository.update(listingId, {
      status: LISTING_STATUSES.PUBLISHED,
      publishedAt: new Date(),
    });

    await emitListingPublished(listingId);

    const updated = await this.repository.findById(listingId);
    return this.serialize(updated);
  }

  async unpublish(userId, listingId) {
    const listing = await this.repository.findById(listingId);
    if (!listing) {
      throw new ListingNotFoundError();
    }
    if (listing.user_id !== userId) {
      throw new ListingNotOwnedError();
    }
    await this.repository.update(listingId, {
      status: LISTING_STATUSES.UNPUBLISHED,
    });
    await emitListingUnpublished(listingId);
    const updated = await this.repository.findById(listingId);
    return this.serialize(updated);
  }

  async feature(listingId, featuredUntil) {
    await this.repository.update(listingId, {
      featured: true,
      featuredUntil: featuredUntil || null,
    });
    await emitListingFeatured(listingId, featuredUntil);
    const updated = await this.repository.findById(listingId);
    return this.serialize(updated);
  }

  async unfeature(listingId) {
    await this.repository.update(listingId, {
      featured: false,
      featuredUntil: null,
    });
    await emitListingUnfeatured(listingId);
    const updated = await this.repository.findById(listingId);
    return this.serialize(updated);
  }

  async remove(userId, listingId) {
    const listing = await this.repository.findById(listingId);
    if (!listing) {
      throw new ListingNotFoundError();
    }
    if (listing.user_id !== userId) {
      throw new ListingNotOwnedError();
    }
    await this.repository.delete(listingId);
    await emitListingDeleted(listingId);
    return { deleted: true };
  }

  async recordView(listingId) {
    await this.repository.incrementViewCount(listingId);
  }

  async recomputeRating(listingId) {
    await this.repository.recomputeRating(listingId);
  }

  serialize(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      providerId: row.provider_id,
      userId: row.user_id,
      title: row.title,
      slug: row.slug,
      shortDescription: row.short_description,
      description: row.description,
      status: row.status,
      visibility: row.visibility,
      categories: row.categories,
      tags: row.tags,
      price: row.price,
      currency: row.currency,
      billingInterval: row.billing_interval,
      trialDays: row.trial_days,
      coverImageUrl: row.cover_image_url,
      media: this.parseJson(row.media),
      highlights: this.parseJson(row.highlights),
      requirements: this.parseJson(row.requirements),
      featured: row.featured,
      featuredUntil: row.featured_until,
      displayOrder: row.display_order,
      ratingAverage: row.rating_average,
      ratingCount: row.rating_count,
      subscriberCount: row.subscriber_count,
      viewCount: row.view_count,
      metadata: this.parseJson(row.metadata),
      publishedAt: row.published_at,
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

export default ListingService;
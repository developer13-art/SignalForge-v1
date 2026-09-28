/**
 * Marketplace Repository
 *
 * @module signalforge/server/modules/marketplace/repository
 */

import { getDatabase } from '../../bootstrap/initDatabase.js';

export class MarketplaceRepository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  async createListing(data) {
    const result = await this.db.query(
      `INSERT INTO marketplace_listings (
         provider_id, user_id, title, slug, description, short_description,
         status, visibility, categories, tags, price, currency, billing_interval,
         trial_days, cover_image_url, media, highlights, requirements,
         featured, featured_until, display_order, metadata, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         $17, $18, $19, $20, $21, $22, NOW(), NOW()
       )
       ON CONFLICT (provider_id) DO NOTHING
       RETURNING id, provider_id, user_id, title, slug, status, visibility,
                 price, currency, billing_interval, featured, created_at`,
      [
        data.providerId,
        data.userId,
        data.title,
        data.slug,
        data.description || null,
        data.shortDescription || null,
        data.status || 'DRAFT',
        data.visibility || 'PUBLIC',
        data.categories || [],
        data.tags || [],
        data.price ?? 0,
        data.currency || 'USD',
        data.billingInterval || 'MONTHLY',
        data.trialDays ?? 7,
        data.coverImageUrl || null,
        data.media ? JSON.stringify(data.media) : null,
        data.highlights ? JSON.stringify(data.highlights) : null,
        data.requirements ? JSON.stringify(data.requirements) : null,
        data.featured === true,
        data.featuredUntil || null,
        data.displayOrder ?? 100,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findListingById(listingId) {
    const result = await this.db.query(
      `SELECT id, provider_id, user_id, title, slug, description, short_description,
              status, visibility, categories, tags, price, currency, billing_interval,
              trial_days, cover_image_url, media, highlights, requirements, featured,
              featured_until, display_order, rating_average, rating_count,
              subscriber_count, view_count, metadata, published_at, created_at, updated_at
         FROM marketplace_listings
        WHERE id = $1
        LIMIT 1`,
      [listingId],
    );
    return result.rows[0] || null;
  }

  async findListingByProviderId(providerId) {
    const result = await this.db.query(
      `SELECT id, provider_id, user_id, title, slug, status, visibility, price,
              currency, billing_interval, featured, rating_average, rating_count,
              subscriber_count, created_at, updated_at
         FROM marketplace_listings
        WHERE provider_id = $1
        LIMIT 1`,
      [providerId],
    );
    return result.rows[0] || null;
  }

  async findListingBySlug(slug) {
    const result = await this.db.query(
      `SELECT id, provider_id, user_id, title, slug, description, short_description,
              status, visibility, categories, tags, price, currency, billing_interval,
              trial_days, cover_image_url, media, highlights, requirements, featured,
              featured_until, rating_average, rating_count, subscriber_count,
              view_count, metadata, published_at, created_at, updated_at
         FROM marketplace_listings
        WHERE slug = $1
        LIMIT 1`,
      [slug],
    );
    return result.rows[0] || null;
  }

  async listListings(filters = {}, pagination = {}) {
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

    if (filters.visibility) {
      conditions.push(`visibility = $${index++}`);
      values.push(filters.visibility);
    }

    if (filters.featured !== undefined) {
      conditions.push(`featured = $${index++}`);
      values.push(filters.featured);
    }

    if (filters.categories && filters.categories.length > 0) {
      conditions.push(`categories && $${index++}::text[]`);
      values.push(filters.categories);
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`tags && $${index++}::text[]`);
      values.push(filters.tags);
    }

    if (filters.search) {
      conditions.push(
        `(title ILIKE $${index} OR short_description ILIKE $${index} OR description ILIKE $${index})`,
      );
      values.push(`%${filters.search}%`);
      index++;
    }

    if (filters.minPrice !== undefined) {
      conditions.push(`price >= $${index++}`);
      values.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(`price <= $${index++}`);
      values.push(filters.maxPrice);
    }

    if (filters.minRating !== undefined) {
      conditions.push(`rating_average >= $${index++}`);
      values.push(filters.minRating);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM marketplace_listings ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, provider_id, user_id, title, slug, short_description, status,
              visibility, categories, tags, price, currency, billing_interval,
              featured, rating_average, rating_count, subscriber_count, view_count,
              cover_image_url, display_order, published_at, created_at
         FROM marketplace_listings
         ${where}
        ORDER BY featured DESC, display_order ASC, rating_average DESC NULLS LAST, created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { listings: result.rows, total, limit, offset };
  }

  async updateListing(listingId, data) {
    const fields = [];
    const values = [listingId];
    let index = 2;

    const mapping = {
      title: 'title',
      slug: 'slug',
      description: 'description',
      shortDescription: 'short_description',
      status: 'status',
      visibility: 'visibility',
      price: 'price',
      currency: 'currency',
      billingInterval: 'billing_interval',
      trialDays: 'trial_days',
      coverImageUrl: 'cover_image_url',
      featured: 'featured',
      featuredUntil: 'featured_until',
      displayOrder: 'display_order',
      ratingAverage: 'rating_average',
      ratingCount: 'rating_count',
      subscriberCount: 'subscriber_count',
      viewCount: 'view_count',
      publishedAt: 'published_at',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    const arrayMapping = {
      categories: 'categories',
      tags: 'tags',
    };

    for (const [key, column] of Object.entries(arrayMapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key]);
      }
    }

    const jsonMapping = {
      media: 'media',
      highlights: 'highlights',
      requirements: 'requirements',
      metadata: 'metadata',
    };

    for (const [key, column] of Object.entries(jsonMapping)) {
      if (data[key] !== undefined) {
        fields.push(`${column} = $${index++}`);
        values.push(data[key] ? JSON.stringify(data[key]) : null);
      }
    }

    if (fields.length === 0) {
      return this.findListingById(listingId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE marketplace_listings SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findListingById(listingId);
  }

  async deleteListing(listingId) {
    await this.db.query('DELETE FROM marketplace_listings WHERE id = $1', [listingId]);
  }

  async incrementViewCount(listingId) {
    await this.db.query(
      `UPDATE marketplace_listings
          SET view_count = view_count + 1,
              updated_at = NOW()
        WHERE id = $1`,
      [listingId],
    );
  }

  async recomputeRating(listingId) {
    const result = await this.db.query(
      `SELECT
         COALESCE(AVG(rating), 0)::numeric AS average,
         COUNT(*)::int AS count
         FROM marketplace_reviews
        WHERE listing_id = $1
          AND status = 'APPROVED'`,
      [listingId],
    );
    const row = result.rows[0] || {};
    await this.db.query(
      `UPDATE marketplace_listings
          SET rating_average = $2,
              rating_count = $3,
              updated_at = NOW()
        WHERE id = $1`,
      [listingId, Number(Number(row.average || 0).toFixed(4)), Number(row.count || 0)],
    );
  }

  async createReview(data) {
    const result = await this.db.query(
      `INSERT INTO marketplace_reviews (
         listing_id, provider_id, reviewer_id, rating, title, comment,
         status, verified_subscriber, metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (listing_id, reviewer_id) DO NOTHING
       RETURNING id, listing_id, provider_id, reviewer_id, rating, status, created_at`,
      [
        data.listingId,
        data.providerId,
        data.reviewerId,
        data.rating,
        data.title || null,
        data.comment || null,
        data.status || 'PENDING',
        data.verifiedSubscriber === true,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findReviewById(reviewId) {
    const result = await this.db.query(
      `SELECT id, listing_id, provider_id, reviewer_id, rating, title, comment,
              status, verified_subscriber, moderated_by, moderated_at,
              moderation_reason, reply, replied_at, replied_by, metadata,
              created_at, updated_at
         FROM marketplace_reviews
        WHERE id = $1
        LIMIT 1`,
      [reviewId],
    );
    return result.rows[0] || null;
  }

  async findReviewByListingAndReviewer(listingId, reviewerId) {
    const result = await this.db.query(
      `SELECT id, listing_id, provider_id, reviewer_id, rating, title, comment,
              status, verified_subscriber, created_at, updated_at
         FROM marketplace_reviews
        WHERE listing_id = $1 AND reviewer_id = $2
        LIMIT 1`,
      [listingId, reviewerId],
    );
    return result.rows[0] || null;
  }

  async listReviews(listingId, filters = {}, pagination = {}) {
    const conditions = ['listing_id = $1'];
    const values = [listingId];
    let index = 2;

    if (filters.status) {
      conditions.push(`status = $${index++}`);
      values.push(filters.status);
    }

    if (filters.minRating !== undefined) {
      conditions.push(`rating >= $${index++}`);
      values.push(filters.minRating);
    }

    if (filters.verifiedOnly) {
      conditions.push(`verified_subscriber = true`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(Math.max(Number(pagination.limit) || 20, 1), 200);
    const offset = Math.max(Number(pagination.offset) || 0, 0);

    const countResult = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM marketplace_reviews ${where}`,
      values,
    );
    const total = countResult.rows[0]?.total || 0;

    const result = await this.db.query(
      `SELECT id, listing_id, provider_id, reviewer_id, rating, title, comment,
              status, verified_subscriber, reply, replied_at, created_at, updated_at
         FROM marketplace_reviews
         ${where}
        ORDER BY created_at DESC
        LIMIT $${index++} OFFSET $${index++}`,
      [...values, limit, offset],
    );

    return { reviews: result.rows, total, limit, offset };
  }

  async updateReview(reviewId, data) {
    const fields = [];
    const values = [reviewId];
    let index = 2;

    const mapping = {
      rating: 'rating',
      title: 'title',
      comment: 'comment',
      status: 'status',
      moderatedBy: 'moderated_by',
      moderatedAt: 'moderated_at',
      moderationReason: 'moderation_reason',
      reply: 'reply',
      repliedAt: 'replied_at',
      repliedBy: 'replied_by',
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
      return this.findReviewById(reviewId);
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE marketplace_reviews SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findReviewById(reviewId);
  }

  async deleteReview(reviewId) {
    await this.db.query('DELETE FROM marketplace_reviews WHERE id = $1', [reviewId]);
  }

  async countReviewsByStatus(listingId) {
    const result = await this.db.query(
      `SELECT status, COUNT(*)::int AS count
         FROM marketplace_reviews
        WHERE listing_id = $1
        GROUP BY status`,
      [listingId],
    );
    return result.rows;
  }

  async createCategory(data) {
    const result = await this.db.query(
      `INSERT INTO marketplace_categories (
         code, label, description, icon_url, parent_id, display_order, is_active,
         metadata, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (code) DO NOTHING
       RETURNING id, code, label, is_active, created_at`,
      [
        data.code,
        data.label,
        data.description || null,
        data.iconUrl || null,
        data.parentId || null,
        data.displayOrder ?? 100,
        data.isActive !== false,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ],
    );
    return result.rows[0] || null;
  }

  async findCategoryByCode(code) {
    const result = await this.db.query(
      `SELECT id, code, label, description, icon_url, parent_id, display_order,
              is_active, metadata, created_at, updated_at
         FROM marketplace_categories
        WHERE code = $1
        LIMIT 1`,
      [code],
    );
    return result.rows[0] || null;
  }

  async listCategories(filters = {}) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.isActive !== undefined) {
      conditions.push(`is_active = $${index++}`);
      values.push(filters.isActive);
    }

    if (filters.parentId !== undefined) {
      conditions.push(`parent_id = $${index++}`);
      values.push(filters.parentId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.db.query(
      `SELECT id, code, label, description, icon_url, parent_id, display_order,
              is_active, created_at, updated_at
         FROM marketplace_categories
         ${where}
        ORDER BY display_order ASC, label ASC`,
      values,
    );
    return result.rows;
  }

  async updateCategory(categoryId, data) {
    const fields = [];
    const values = [categoryId];
    let index = 2;

    const mapping = {
      label: 'label',
      description: 'description',
      iconUrl: 'icon_url',
      parentId: 'parent_id',
      displayOrder: 'display_order',
      isActive: 'is_active',
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
      return null;
    }

    fields.push('updated_at = NOW()');

    await this.db.query(
      `UPDATE marketplace_categories SET ${fields.join(', ')} WHERE id = $1`,
      values,
    );
    return this.findCategoryByCode(
      (await this.db.query('SELECT code FROM marketplace_categories WHERE id = $1', [categoryId]))
        .rows[0]?.code,
    );
  }

  async deleteCategory(categoryId) {
    await this.db.query('DELETE FROM marketplace_categories WHERE id = $1', [categoryId]);
  }

  async countListingsByCategory() {
    const result = await this.db.query(
      `SELECT category, COUNT(*)::int AS count
         FROM (
           SELECT UNNEST(categories) AS category
             FROM marketplace_listings
            WHERE status = 'PUBLISHED'
         ) sub
        GROUP BY category
        ORDER BY count DESC`,
    );
    return result.rows;
  }

  async listFeaturedListings(limit = 20) {
    const result = await this.db.query(
      `SELECT id, provider_id, title, slug, short_description, categories, tags,
              price, currency, billing_interval, featured, rating_average,
              rating_count, subscriber_count, cover_image_url, published_at
         FROM marketplace_listings
        WHERE status = 'PUBLISHED'
          AND featured = true
          AND (featured_until IS NULL OR featured_until > NOW())
        ORDER BY display_order ASC, rating_average DESC NULLS LAST
        LIMIT $1`,
      [limit],
    );
    return result.rows;
  }
}

export default MarketplaceRepository;
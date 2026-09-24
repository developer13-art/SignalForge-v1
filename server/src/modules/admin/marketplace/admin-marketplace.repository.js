/**
 * Admin Marketplace Repository
 *
 * @module server/modules/admin/marketplace/admin-marketplace.repository
 */

import { db } from '../../../database';
import { nowIso } from '@signalforge/shared/utils/date.util';

export async function listListings({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`ml.status = $${params.length}`);
  }

  if (filters.providerId) {
    params.push(filters.providerId);
    conditions.push(`ml.provider_id = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT ml.id, ml.provider_id, ml.title, ml.status, ml.price, ml.currency,
            ml.review_count, ml.rating_average, ml.created_at, p.display_name AS provider_name
       FROM marketplace_listings ml
       LEFT JOIN providers p ON p.id = ml.provider_id
       ${where}
       ORDER BY ml.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM marketplace_listings ml ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function updateListingStatus({ listingId, status }) {
  const { rowCount } = await db.query(
    `UPDATE marketplace_listings
        SET status = $1, updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), listingId],
  );
  return rowCount > 0;
}

export async function deleteListing({ listingId }) {
  const { rowCount } = await db.query(
    `DELETE FROM marketplace_listings WHERE id = $1`,
    [listingId],
  );
  return rowCount > 0;
}

export async function listReviews({ filters = {}, pagination = {} }) {
  const conditions = [];
  const params = [];

  if (filters.listingId) {
    params.push(filters.listingId);
    conditions.push(`r.listing_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`r.status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = pagination.limit || 20;
  const offset = pagination.offset || 0;

  const { rows } = await db.query(
    `SELECT r.id, r.listing_id, r.author_id, r.rating, r.body, r.status, r.created_at, u.email AS author_email
       FROM marketplace_reviews r
       LEFT JOIN users u ON u.id = r.author_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM marketplace_reviews r ${where}`,
    params,
  );

  return {
    items: rows,
    total: countResult.rows[0]?.total || 0,
  };
}

export async function updateReviewStatus({ reviewId, status }) {
  const { rowCount } = await db.query(
    `UPDATE marketplace_reviews
        SET status = $1, updated_at = $2
      WHERE id = $3`,
    [status, nowIso(), reviewId],
  );
  return rowCount > 0;
}

export async function deleteReview({ reviewId }) {
  const { rowCount } = await db.query(
    `DELETE FROM marketplace_reviews WHERE id = $1`,
    [reviewId],
  );
  return rowCount > 0;
}

export const adminMarketplaceRepository = {
  listListings,
  updateListingStatus,
  deleteListing,
  listReviews,
  updateReviewStatus,
  deleteReview,
};
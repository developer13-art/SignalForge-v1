/**
 * Admin Marketplace Service
 *
 * @module server/modules/admin/marketplace/admin-marketplace.service
 */

import { AppError } from '../../../lib/errors/app-error';
import { ERROR_CODES } from '../../../lib/errors/error-codes';
import { logger } from '../../../lib/logger';
import { normalizePagination, buildPaginationMeta } from '@signalforge/shared/utils/pagination.util';
import * as repository from './admin-marketplace.repository';
import { adminService } from '../admin.service';

export async function listListings({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listListings({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      listingId: row.id,
      providerId: row.provider_id,
      providerName: row.provider_name,
      title: row.title,
      status: row.status,
      price: row.price,
      currency: row.currency,
      reviewCount: row.review_count,
      ratingAverage: row.rating_average,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function suspendListing({ listingId, adminId, reason }) {
  if (!listingId || !adminId) {
    throw new AppError('listingId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateListingStatus({ listingId, status: 'SUSPENDED' });

  if (!updated) {
    throw new AppError('Listing not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SYSTEM_SETTING_UPDATE',
    targetType: 'LISTING',
    targetId: listingId,
    details: { action: 'SUSPEND_LISTING', reason },
  });

  logger.info({ listingId, adminId, reason }, 'Marketplace listing suspended');

  return { suspended: true };
}

export async function removeListing({ listingId, adminId, reason }) {
  if (!listingId || !adminId) {
    throw new AppError('listingId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deleted = await repository.deleteListing({ listingId });

  if (!deleted) {
    throw new AppError('Listing not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SYSTEM_SETTING_UPDATE',
    targetType: 'LISTING',
    targetId: listingId,
    details: { action: 'REMOVE_LISTING', reason },
  });

  return { removed: true };
}

export async function listReviews({ filters = {}, pagination = {} }) {
  const { page, limit, offset } = normalizePagination(pagination);

  const result = await repository.listReviews({
    filters,
    pagination: { limit, offset },
  });

  return {
    items: result.items.map((row) => ({
      reviewId: row.id,
      listingId: row.listing_id,
      authorId: row.author_id,
      authorEmail: row.author_email,
      rating: row.rating,
      body: row.body,
      status: row.status,
      createdAt: row.created_at,
    })),
    meta: buildPaginationMeta({ page, limit, total: result.total }),
  };
}

export async function approveReview({ reviewId, adminId }) {
  if (!reviewId || !adminId) {
    throw new AppError('reviewId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateReviewStatus({ reviewId, status: 'APPROVED' });

  if (!updated) {
    throw new AppError('Review not found', ERROR_CODES.NOT_FOUND, 404);
  }

  return { approved: true };
}

export async function rejectReview({ reviewId, adminId, reason }) {
  if (!reviewId || !adminId) {
    throw new AppError('reviewId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const updated = await repository.updateReviewStatus({ reviewId, status: 'REJECTED' });

  if (!updated) {
    throw new AppError('Review not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SYSTEM_SETTING_UPDATE',
    targetType: 'REVIEW',
    targetId: reviewId,
    details: { action: 'REJECT_REVIEW', reason },
  });

  return { rejected: true };
}

export async function removeReview({ reviewId, adminId, reason }) {
  if (!reviewId || !adminId) {
    throw new AppError('reviewId and adminId are required', ERROR_CODES.VALIDATION_FAILED, 400);
  }

  const deleted = await repository.deleteReview({ reviewId });

  if (!deleted) {
    throw new AppError('Review not found', ERROR_CODES.NOT_FOUND, 404);
  }

  await adminService.recordAdminAction({
    adminId,
    action: 'SYSTEM_SETTING_UPDATE',
    targetType: 'REVIEW',
    targetId: reviewId,
    details: { action: 'REMOVE_REVIEW', reason },
  });

  return { removed: true };
}

export const adminMarketplaceService = {
  listListings,
  suspendListing,
  removeListing,
  listReviews,
  approveReview,
  rejectReview,
  removeReview,
};
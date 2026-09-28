/**
 * Marketplace Routes
 *
 * @module signalforge/server/modules/marketplace/routes
 */

import { Router } from 'express';

import { MarketplaceController } from './marketplace.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';
import { optionalAuthenticationMiddleware } from '../../middleware/optional-authentication.middleware.js';
import { requireAdminMiddleware } from '../../middleware/require-admin.middleware.js';

export function buildMarketplaceRouter(controller = null) {
  const router = Router();
  const marketplaceController = controller || new MarketplaceController();

  router.get('/marketplace/listings', marketplaceController.listListings);
  router.get('/marketplace/listings/featured', marketplaceController.listFeatured);
  router.get('/marketplace/listings/trending', marketplaceController.getTrending);
  router.get('/marketplace/listings/slug/:slug', marketplaceController.getListingBySlug);
  router.get('/marketplace/listings/:listingId', marketplaceController.getListing);
  router.post('/marketplace/listings/:listingId/view', marketplaceController.recordView);

  router.get('/marketplace/search', optionalAuthenticationMiddleware(), marketplaceController.search);
  router.get('/marketplace/categories', marketplaceController.listCategories);
  router.get('/marketplace/categories/counts', marketplaceController.getCategoryCounts);
  router.get('/marketplace/categories/:code', marketplaceController.getCategoryByCode);

  router.get('/marketplace/listings/:listingId/reviews', marketplaceController.listReviews);
  router.get('/marketplace/listings/:listingId/reviews/counts', marketplaceController.getReviewStatusCounts);
  router.get('/marketplace/reviews/:reviewId', marketplaceController.getReview);

  router.post('/marketplace/compare', marketplaceController.compareProviders);
  router.post('/marketplace/consensus', marketplaceController.computeConsensus);

  router.use(authenticationMiddleware());

  router.post(
    '/marketplace/providers/:providerId/listing',
    marketplaceController.createListing,
  );
  router.get(
    '/marketplace/providers/:providerId/listing',
    marketplaceController.getListing,
  );
  router.patch(
    '/marketplace/listings/:listingId',
    marketplaceController.updateListing,
  );
  router.post(
    '/marketplace/listings/:listingId/publish',
    marketplaceController.publishListing,
  );
  router.post(
    '/marketplace/listings/:listingId/unpublish',
    marketplaceController.unpublishListing,
  );
  router.delete(
    '/marketplace/listings/:listingId',
    marketplaceController.deleteListing,
  );

  router.get('/marketplace/recommendations', marketplaceController.getRecommendations);

  router.post('/marketplace/listings/:listingId/reviews', marketplaceController.addReview);
  router.patch('/marketplace/reviews/:reviewId', marketplaceController.updateReview);
  router.delete('/marketplace/reviews/:reviewId', marketplaceController.deleteReview);
  router.post('/marketplace/reviews/:reviewId/reply', marketplaceController.replyToReview);

  router.post(
    '/marketplace/categories',
    requireAdminMiddleware(),
    marketplaceController.createCategory,
  );
  router.patch(
    '/marketplace/categories/:categoryId',
    requireAdminMiddleware(),
    marketplaceController.updateCategory,
  );
  router.delete(
    '/marketplace/categories/:categoryId',
    requireAdminMiddleware(),
    marketplaceController.deleteCategory,
  );

  router.post(
    '/marketplace/reviews/:reviewId/moderate',
    requireAdminMiddleware(),
    marketplaceController.moderateReview,
  );

  return router;
}

export default buildMarketplaceRouter;
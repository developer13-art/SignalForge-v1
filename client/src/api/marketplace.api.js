/**
 * Marketplace API
 *
 * @module client/src/api/marketplace.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const marketplaceApi = {
  listListings: (params) => get(endpoints.marketplace.listings, { params }),

  getListing: (listingId) => get(endpoints.marketplace.listing(listingId)),

  listReviews: (params) => get(endpoints.marketplace.reviews, { params }),

  getReview: (reviewId) => get(endpoints.marketplace.review(reviewId)),

  submitReview: (payload) => post(endpoints.marketplace.reviews, payload),

  search: (params) => get(endpoints.marketplace.search, { params }),

  listCategories: () => get(endpoints.marketplace.categories),

  listFeatured: () => get(endpoints.marketplace.featured),

  listTop: (params) => get(endpoints.marketplace.top, { params }),

  compare: (ids) => post(endpoints.marketplace.compare, { ids }),

  getConsensus: (params) => get(endpoints.marketplace.consensus, { params }),
};

export default marketplaceApi;
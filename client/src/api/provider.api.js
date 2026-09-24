/**
 * Providers API
 *
 * @module client/src/api/provider.api
 */

import { get, post, patch } from './client.js';
import { endpoints } from './endpoints.js';

export const providerApi = {
  list: (params) => get(endpoints.providers.list, { params }),

  get: (providerId) => get(endpoints.providers.profile(providerId)),

  update: (providerId, payload) => patch(endpoints.providers.update(providerId), payload),

  register: (payload) => post(endpoints.providers.register, payload),

  getMyProfile: () => get(endpoints.providers.my),

  listSubscribers: (providerId, params) =>
    get(endpoints.providers.subscribers(providerId), { params }),

  getRevenue: (providerId, params) => get(endpoints.providers.revenue(providerId), { params }),

  getPerformance: (providerId, params) =>
    get(endpoints.providers.performance(providerId), { params }),

  listSignals: (providerId, params) => get(endpoints.providers.signals(providerId), { params }),

  listReviews: (providerId, params) => get(endpoints.providers.reviews(providerId), { params }),

  listPlans: (providerId) => get(endpoints.providers.subscriptionPlans(providerId)),

  subscribe: (providerId, payload) => post(endpoints.providers.subscribe(providerId), payload),

  unsubscribe: (providerId) => post(endpoints.providers.unsubscribe(providerId)),
};

export default providerApi;
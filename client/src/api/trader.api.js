/**
 * Traders API
 *
 * @module client/src/api/trader.api
 */

import { get, post, patch } from './client.js';
import { endpoints } from './endpoints.js';

export const traderApi = {
  list: (params) => get(endpoints.traders.list, { params }),

  get: (traderId) => get(endpoints.traders.profile(traderId)),

  getPerformance: (traderId, params) =>
    get(endpoints.traders.performance(traderId), { params }),

  getRisk: (traderId) => get(endpoints.traders.risk(traderId)),

  getBehavior: (traderId, params) => get(endpoints.traders.behavior(traderId), { params }),

  getIntelligence: (traderId, params) =>
    get(endpoints.traders.intelligence(traderId), { params }),

  listReviews: (traderId, params) => get(endpoints.traders.reviews(traderId), { params }),

  getStyle: (traderId) => get(endpoints.traders.style(traderId)),

  follow: (traderId, payload) => post(endpoints.traders.follow(traderId), payload),

  unfollow: (traderId) => post(endpoints.traders.unfollow(traderId)),

  getCopySettings: () => get(endpoints.traders.copySettings),

  updateCopySettings: (payload) => patch(endpoints.traders.copySettings, payload),

  listMyFollowed: (params) => get(endpoints.traders.myFollowed, { params }),

  getLeaderboard: (params) => get(endpoints.traders.leaderboard, { params }),
};

export default traderApi;
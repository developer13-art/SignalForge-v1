/**
 * Copy Trading API
 *
 * @module client/src/api/copy-trading.api
 */

import { get, post, patch, del } from './client.js';
import { endpoints } from './endpoints.js';

export const copyTradingApi = {
  listSubscriptions: (params) => get(endpoints.copyTrading.subscriptions, { params }),

  subscribe: (payload) => post(endpoints.copyTrading.subscribe, payload),

  unsubscribe: (subscriptionId) => del(endpoints.copyTrading.unsubscribe(subscriptionId)),

  getSettings: () => get(endpoints.copyTrading.settings),

  updateSettings: (payload) => patch(endpoints.copyTrading.settings, payload),

  getScaling: () => get(endpoints.copyTrading.scaling),

  updateScaling: (payload) => patch(endpoints.copyTrading.scaling, payload),

  getStatus: () => get(endpoints.copyTrading.status),
};

export default copyTradingApi;
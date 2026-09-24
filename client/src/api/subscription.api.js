/**
 * Subscriptions API
 *
 * @module client/src/api/subscription.api
 */

import { get, post } from './client.js';
import { endpoints } from './endpoints.js';

export const subscriptionApi = {
  listPlans: () => get(endpoints.subscriptions.plans),

  getCurrentSubscription: () => get(endpoints.subscriptions.current),

  createSubscription: (payload) => post(endpoints.subscriptions.create, payload),

  upgradeSubscription: (payload) => post(endpoints.subscriptions.upgrade, payload),

  downgradeSubscription: (payload) => post(endpoints.subscriptions.downgrade, payload),

  cancelSubscription: (payload) => post(endpoints.subscriptions.cancel, payload),

  getUsage: () => get(endpoints.subscriptions.usage),
};

export default subscriptionApi;
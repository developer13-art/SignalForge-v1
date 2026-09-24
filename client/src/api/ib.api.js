/**
 * IB API
 *
 * @module client/src/api/ib.api
 */

import { get, post, del } from './client.js';
import { endpoints } from './endpoints.js';

export const ibApi = {
  getDashboard: () => get(endpoints.ib.dashboard),

  listLinks: () => get(endpoints.ib.links),

  createLink: (payload) => post(endpoints.ib.createLink, payload),

  removeLink: (linkId) => del(endpoints.ib.link(linkId)),

  listReferrals: (params) => get(endpoints.ib.referrals, { params }),

  getRevenue: (params) => get(endpoints.ib.revenue, { params }),

  listRevenueEntries: (params) => get(endpoints.ib.revenueEntries, { params }),

  listCommissions: (params) => get(endpoints.ib.commissions, { params }),
};

export default ibApi;
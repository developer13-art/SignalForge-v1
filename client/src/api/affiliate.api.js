/**
 * Affiliate API
 *
 * @module client/src/api/affiliate.api
 */

import { get, post, del } from './client.js';
import { endpoints } from './endpoints.js';

export const affiliateApi = {
  getDashboard: () => get(endpoints.affiliate.dashboard),

  listLinks: () => get(endpoints.affiliate.links),

  createLink: (payload) => post(endpoints.affiliate.createLink, payload),

  removeLink: (linkId) => del(endpoints.affiliate.link(linkId)),

  listReferrals: (params) => get(endpoints.affiliate.referrals, { params }),

  listCommissions: (params) => get(endpoints.affiliate.commissions, { params }),

  getCommissionSummary: () => get(endpoints.affiliate.summary),

  requestWithdrawal: (payload) => post(endpoints.affiliate.withdraw, payload),

  listWithdrawals: (params) => get(endpoints.affiliate.withdrawals, { params }),
};

export default affiliateApi;
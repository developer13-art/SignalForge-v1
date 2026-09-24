/**
 * Referrals API
 *
 * @module client/src/api/referral.api
 */

import { get } from './client.js';
import { endpoints } from './endpoints.js';

export const referralApi = {
  getCode: () => get(endpoints.referrals.code),

  getDashboard: () => get(endpoints.referrals.dashboard),

  getNetwork: () => get(endpoints.referrals.network),

  listReferredUsers: (params) => get(endpoints.referrals.referredUsers, { params }),

  getPerformance: (params) => get(endpoints.referrals.performance, { params }),

  getEarnings: (params) => get(endpoints.referrals.earnings, { params }),

  listPendingRewards: (params) => get(endpoints.referrals.pendingRewards, { params }),

  listAvailableRewards: (params) => get(endpoints.referrals.availableRewards, { params }),

  getWallet: () => get(endpoints.referrals.wallet),

  listRewardHistory: (params) => get(endpoints.referrals.rewardHistory, { params }),

  listMonthlySettlements: (params) => get(endpoints.referrals.monthlySettlement, { params }),

  getLeaderboard: (params) => get(endpoints.referrals.leaderboard, { params }),
};

export default referralApi;
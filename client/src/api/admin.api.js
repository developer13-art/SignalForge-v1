/**
 * Admin API
 *
 * @module client/src/api/admin.api
 */

import { get, post, put, del } from './client.js';
import { endpoints } from './endpoints.js';

export const adminApi = {
  getOverview: (params) => get(endpoints.admin.overview, { params }),

  listActions: (params) => get(endpoints.admin.actions, { params }),

  getSystemHealth: () => get(endpoints.admin.health),

  listUsers: (params) => get(endpoints.admin.users, { params }),

  getUser: (userId) => get(endpoints.admin.user(userId)),

  suspendUser: (userId, payload) => post(endpoints.admin.suspendUser(userId), payload),

  activateUser: (userId) => post(endpoints.admin.activateUser(userId)),

  deactivateUser: (userId, payload) => post(endpoints.admin.deactivateUser(userId), payload),

  revokeUserSessions: (userId) => post(endpoints.admin.revokeSessions(userId)),

  getUserStatusBreakdown: () => get(endpoints.admin.userStatusBreakdown),

  listProviders: (params) => get(endpoints.admin.providers, { params }),

  getProvider: (providerId) => get(endpoints.admin.provider(providerId)),

  approveProvider: (providerId, payload) =>
    post(endpoints.admin.approveProvider(providerId), payload),

  suspendProvider: (providerId, payload) =>
    post(endpoints.admin.suspendProvider(providerId), payload),

  certifyProvider: (providerId, payload) =>
    post(endpoints.admin.certifyProvider(providerId), payload),

  getProviderStatusBreakdown: () => get(endpoints.admin.providerStatusBreakdown),

  listSignals: (params) => get(endpoints.admin.signals, { params }),

  getSignal: (signalId) => get(endpoints.admin.signal(signalId)),

  getSignalStatusBreakdown: (params) =>
    get(endpoints.admin.signalStatusBreakdown, { params }),

  listRejectedSignals: (params) => get(endpoints.admin.rejectedSignals, { params }),

  listDuplicateSignals: (params) => get(endpoints.admin.duplicateSignals, { params }),

  listTrades: (params) => get(endpoints.admin.trades, { params }),

  getTrade: (tradeId) => get(endpoints.admin.trade(tradeId)),

  forceCloseTrade: (tradeId, payload) => post(endpoints.admin.forceCloseTrade(tradeId), payload),

  getTradeStatusBreakdown: (params) => get(endpoints.admin.tradeStatusBreakdown, { params }),

  listBrokerAccounts: (params) => get(endpoints.admin.brokers, { params }),

  getBrokerAccount: (brokerAccountId) => get(endpoints.admin.brokerAccount(brokerAccountId)),

  disconnectBroker: (brokerAccountId, payload) =>
    post(endpoints.admin.disconnectBroker(brokerAccountId), payload),

  getBrokerStatusBreakdown: () => get(endpoints.admin.brokerStatusBreakdown),

  listKycApplications: (params) => get(endpoints.admin.kyc, { params }),

  getKycApplication: (applicationId) => get(endpoints.admin.kycApplication(applicationId)),

  getKycStatusBreakdown: () => get(endpoints.admin.kycStatusBreakdown),

  listMarketplaceListings: (params) =>
    get(endpoints.admin.marketplaceListings, { params }),

  suspendListing: (listingId, payload) =>
    post(endpoints.admin.suspendListing(listingId), payload),

  removeListing: (listingId, payload) => del(endpoints.admin.removeListing(listingId), { data: payload }),

  listMarketplaceReviews: (params) => get(endpoints.admin.marketplaceReviews, { params }),

  approveReview: (reviewId) => post(endpoints.admin.approveReview(reviewId)),

  rejectReview: (reviewId, payload) => post(endpoints.admin.rejectReview(reviewId), payload),

  removeReview: (reviewId, payload) => del(endpoints.admin.removeReview(reviewId), { data: payload }),

  listReferralRewards: (params) => get(endpoints.admin.referralRewards, { params }),

  getReferralReward: (rewardId) => get(endpoints.admin.referralReward(rewardId)),

  approveReferralReward: (rewardId, payload) =>
    post(endpoints.admin.approveReferral(rewardId), payload),

  rejectReferralReward: (rewardId, payload) =>
    post(endpoints.admin.rejectReferral(rewardId), payload),

  listReferralRelationships: (params) =>
    get(endpoints.admin.referralRelationships, { params }),

  getReferralStatusBreakdown: () => get(endpoints.admin.referralStatusBreakdown),

  listSubscriptions: (params) => get(endpoints.admin.subscriptions, { params }),

  getSubscription: (subscriptionId) => get(endpoints.admin.subscription(subscriptionId)),

  cancelSubscription: (subscriptionId, payload) =>
    post(endpoints.admin.cancelSubscription(subscriptionId), payload),

  extendSubscription: (subscriptionId, payload) =>
    post(endpoints.admin.extendSubscription(subscriptionId), payload),

  reactivateSubscription: (subscriptionId) =>
    post(endpoints.admin.reactivateSubscription(subscriptionId)),

  getSubscriptionStatusBreakdown: () => get(endpoints.admin.subscriptionStatusBreakdown),

  listPayments: (params) => get(endpoints.admin.payments, { params }),

  getPayment: (paymentId) => get(endpoints.admin.payment(paymentId)),

  refundPayment: (paymentId, payload) => post(endpoints.admin.refundPayment(paymentId), payload),

  getPaymentStatusBreakdown: (params) => get(endpoints.admin.paymentStatusBreakdown, { params }),

  getRevenueByProvider: (params) => get(endpoints.admin.revenueByProvider, { params }),

  listWithdrawals: (params) => get(endpoints.admin.withdrawals, { params }),

  getWithdrawal: (withdrawalId) => get(endpoints.admin.withdrawal(withdrawalId)),

  approveWithdrawal: (withdrawalId) => post(endpoints.admin.approveWithdrawal(withdrawalId)),

  rejectWithdrawal: (withdrawalId, payload) =>
    post(endpoints.admin.rejectWithdrawal(withdrawalId), payload),

  completeWithdrawal: (withdrawalId) => post(endpoints.admin.completeWithdrawal(withdrawalId)),

  getWithdrawalStatusBreakdown: () => get(endpoints.admin.withdrawalStatusBreakdown),

  listAffiliatePartners: (params) => get(endpoints.admin.affiliatePartners, { params }),

  getAffiliatePartner: (partnerId) => get(endpoints.admin.affiliatePartner(partnerId)),

  suspendAffiliate: (partnerId, payload) =>
    post(endpoints.admin.suspendAffiliate(partnerId), payload),

  activateAffiliate: (partnerId) => post(endpoints.admin.activateAffiliate(partnerId)),

  updateAffiliateTier: (partnerId, payload) =>
    post(endpoints.admin.affiliateTier(partnerId), payload),

  listAffiliateCommissions: (params) => get(endpoints.admin.affiliateCommissions, { params }),

  getAffiliateStatusBreakdown: () => get(endpoints.admin.affiliateStatusBreakdown),

  listSystemSettings: (params) => get(endpoints.admin.systemSettings, { params }),

  listPublicSettings: () => get(endpoints.admin.publicSettings),

  getSystemSetting: (key) => get(endpoints.admin.systemSetting(key)),

  setSystemSetting: (key, payload) => put(endpoints.admin.systemSetting(key), payload),

  deleteSystemSetting: (key) => del(endpoints.admin.systemSetting(key)),

  listFeatureFlags: () => get(endpoints.admin.featureFlags),

  getFeatureFlag: (flagName) => get(endpoints.admin.featureFlag(flagName)),

  setFeatureFlag: (flagName, payload) => put(endpoints.admin.featureFlag(flagName), payload),

  getSystemHealthDetailed: () => get(endpoints.admin.systemHealth),

  getSystemHealthQuick: () => get(endpoints.admin.systemHealthQuick),

  getPlatformReport: (params) => get(endpoints.admin.reportPlatform, { params }),

  getUserGrowthReport: (params) => get(endpoints.admin.reportUserGrowth, { params }),

  getSignalActivityReport: (params) => get(endpoints.admin.reportSignalActivity, { params }),

  getTradeActivityReport: (params) => get(endpoints.admin.reportTradeActivity, { params }),

  getRevenueReport: (params) => get(endpoints.admin.reportRevenue, { params }),

  getReferralReport: (params) => get(endpoints.admin.reportReferrals, { params }),

  exportReport: (params) =>
    get(endpoints.admin.reportExport, { params, responseType: 'blob' }),
};

export default adminApi;
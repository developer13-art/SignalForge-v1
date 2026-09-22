/**
 * Provider Type Definitions
 *
 * Provides JSDoc typedefs for signal provider objects.
 *
 * @module @signalforge/shared/types/provider
 */

/**
 * @typedef {Object} Provider
 * @property {string} providerId
 * @property {string} userId
 * @property {string} displayName
 * @property {string|null} bio
 * @property {string|null} avatarUrl
 * @property {string} status
 * @property {string|null} certificationStatus
 * @property {string|null} certificationVersion
 * @property {number} subscriberCount
 * @property {number} totalSignals
 * @property {number} validatedSignals
 * @property {number} executedSignals
 * @property {number} winningTrades
 * @property {number} losingTrades
 * @property {number|null} winRate
 * @property {number|null} averageRr
 * @property {number|null} consistencyScore
 * @property {number|null} reputationScore
 * @property {string|null} solanaAttestationId
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ProviderDna
 * @property {string} dnaId
 * @property {string} providerId
 * @property {string} version
 * @property {string} language
 * @property {Object} symbolMappings
 * @property {Object} abbreviationMappings
 * @property {Object} riskStyle
 * @property {Object} tradeManagementStyle
 * @property {number} confidence
 * @property {number} ruleCount
 * @property {boolean} active
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ProviderCertification
 * @property {string} certificationId
 * @property {string} providerId
 * @property {string} status
 * @property {string} version
 * @property {number|null} parsingAccuracy
 * @property {number|null} managementAccuracy
 * @property {number|null} qualityScore
 * @property {number|null} riskScore
 * @property {number|null} consistencyScore
 * @property {number} historicalMessagesImported
 * @property {number} signalsDetected
 * @property {number} signalsValidated
 * @property {string|null} recommendation
 * @property {string|null} certifiedBy
 * @property {string|null} certifiedAt
 * @property {string|null} expiresAt
 * @property {Object|null} details
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ProviderSubscription
 * @property {string} subscriptionId
 * @property {string} providerId
 * @property {string} subscriberId
 * @property {string} planId
 * @property {string} status
 * @property {string} startedAt
 * @property {string|null} expiresAt
 * @property {number} amountPaid
 * @property {string} currency
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ProviderRevenue
 * @property {string} revenueId
 * @property {string} providerId
 * @property {string} period
 * @property {number} grossRevenue
 * @property {number} platformFee
 * @property {number} netRevenue
 * @property {number} subscriberCount
 * @property {string} currency
 * @property {string} recordedAt
 */

/**
 * @typedef {Object} ProviderReview
 * @property {string} reviewId
 * @property {string} providerId
 * @property {string} reviewerId
 * @property {number} rating
 * @property {string|null} comment
 * @property {string} status
 * @property {string|null} moderatedBy
 * @property {string|null} moderatedAt
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ProviderSubscriptionPlan
 * @property {string} planId
 * @property {string} providerId
 * @property {string} name
 * @property {string|null} description
 * @property {number} price
 * @property {string} currency
 * @property {string} interval
 * @property {number} trialDays
 * @property {boolean} enabled
 * @property {Array<string>} features
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export const PROVIDER_TYPES = Object.freeze({
  Provider: 'Provider',
  ProviderDna: 'ProviderDna',
  ProviderCertification: 'ProviderCertification',
  ProviderSubscription: 'ProviderSubscription',
  ProviderRevenue: 'ProviderRevenue',
  ProviderReview: 'ProviderReview',
  ProviderSubscriptionPlan: 'ProviderSubscriptionPlan',
});
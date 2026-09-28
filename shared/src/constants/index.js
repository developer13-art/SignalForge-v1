'use strict';

/**
 * SignalForge - Shared Constants Root
 *
 * Aggregates every constant module in the shared package so that
 * consumers import from a single location. New features add their
 * constants to this file when their constants folder is created.
 */

const coreConstants = require('./roles');
const permissions = require('./permissions');
const accountStatuses = require('./account-statuses');
const kycStatuses = require('./kyc-statuses');
const kycDocumentTypes = require('./kyc-document-types');
const tradeStates = require('./trade-states');
const tradeEvents = require('./trade-events');
const tradeActors = require('./trade-actors');
const signalClassifications = require('./signal-classifications');
const signalStatuses = require('./signal-statuses');
const orderTypes = require('./order-types');
const orderDirections = require('./order-directions');
const subscriptionStatuses = require('./subscription-statuses');
const subscriptionPlans = require('./subscription-plans');
const paymentStatuses = require('./payment-statuses');
const paymentProviders = require('./payment-providers');
const withdrawalStatuses = require('./withdrawal-statuses');
const referralStatuses = require('./referral-statuses');
const referralSettlementStatuses = require('./referral-settlement-statuses');
const ledgerEntryTypes = require('./ledger-entry-types');
const notificationTypes = require('./notification-types');
const notificationChannels = require('./notification-channels');
const jobTypes = require('./job-types');
const jobStatuses = require('./job-statuses');
const eventTypes = require('./event-types');
const brokerPlatforms = require('./broker-platforms');
const accountTypes = require('./account-types');
const sourceTypes = require('./source-types');
const providerCertificationStatuses = require('./provider-certification-statuses');
const marketplaceCategories = require('./marketplace-categories');
const tradingStyles = require('./trading-styles');
const solanaNetworks = require('./solana-networks');
const solanaTokens = require('./solana-tokens');
const solanaAttestationTypes = require('./solana-attestation-types');
const solanaPaymentStatuses = require('./solana-payment-statuses');

// Feature A
const solanaActions = require('./solana-actions');

// Feature B
const proofOfAlpha = require('./proof-of-alpha');

// Feature C
const cryptoPairs = require('./crypto-pairs');

module.exports = {
  ...coreConstants,
  ...permissions,
  ...accountStatuses,
  ...kycStatuses,
  ...kycDocumentTypes,
  ...tradeStates,
  ...tradeEvents,
  ...tradeActors,
  ...signalClassifications,
  ...signalStatuses,
  ...orderTypes,
  ...orderDirections,
  ...subscriptionStatuses,
  ...subscriptionPlans,
  ...paymentStatuses,
  ...paymentProviders,
  ...withdrawalStatuses,
  ...referralStatuses,
  ...referralSettlementStatuses,
  ...ledgerEntryTypes,
  ...notificationTypes,
  ...notificationChannels,
  ...jobTypes,
  ...jobStatuses,
  ...eventTypes,
  ...brokerPlatforms,
  ...accountTypes,
  ...sourceTypes,
  ...providerCertificationStatuses,
  ...marketplaceCategories,
  ...tradingStyles,
  ...solanaNetworks,
  ...solanaTokens,
  ...solanaAttestationTypes,
  ...solanaPaymentStatuses,

  // Feature A
  SOLANA_ACTIONS: solanaActions,

  // Feature B
  PROOF_OF_ALPHA: proofOfAlpha,

  // Feature C
  CRYPTO_PAIRS: cryptoPairs,
};
'use strict';

/**
 * SignalForge - Shared Constants Root
 *
 * Aggregates every constant module in the shared package so that
 * consumers import from a single location. New features add their
 * constants to this file when their constants folder is created.
 */

const coreConstants = require('./roles.js');
const permissions = require('./permissions.js');
const accountStatuses = require('./account-statuses.js');
const kycStatuses = require('./kyc-statuses.js');
const kycDocumentTypes = require('./kyc-document-types.js');
const tradeStates = require('./trade-states.js');
const tradeEvents = require('./trade-events.js');
const tradeActors = require('./trade-actors.js');
const signalClassifications = require('./signal-classifications.js');
const signalStatuses = require('./signal-statuses.js');
const orderTypes = require('./order-types.js');
const orderDirections = require('./order-directions.js');
const subscriptionStatuses = require('./subscription-statuses.js');
const subscriptionPlans = require('./subscription-plans.js');
const paymentStatuses = require('./payment-statuses.js');
const paymentProviders = require('./payment-providers.js');
const withdrawalStatuses = require('./withdrawal-statuses.js');
const referralStatuses = require('./referral-statuses.js');
const referralSettlementStatuses = require('./referral-settlement-statuses.js');
const ledgerEntryTypes = require('./ledger-entry-types.js');
const notificationTypes = require('./notification-types.js');
const notificationChannels = require('./notification-channels.js');
const jobTypes = require('./job-types.js');
const jobStatuses = require('./job-statuses.js');
const eventTypes = require('./event-types.js');
const brokerPlatforms = require('./broker-platforms.js');
const accountTypes = require('./account-types.js');
const sourceTypes = require('./source-types.js');
const providerCertificationStatuses = require('./provider-certification-statuses.js');
const marketplaceCategories = require('./marketplace-categories.js');
const tradingStyles = require('./trading-styles.js');
const solanaNetworks = require('./solana-networks.js');
const solanaTokens = require('./solana-tokens.js');
const solanaAttestationTypes = require('./solana-attestation-types.js');
const solanaPaymentStatuses = require('./solana-payment-statuses.js');

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
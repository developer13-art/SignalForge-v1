'use strict';

/**
 * SignalForge - Shared Constants Root
 *
 * Aggregates every constant module in the shared package so that
 * consumers import from a single location. New features add their
 * constants to this file when their constants folder is created.
 */

const coreConstants = require('./roles.cjs');
const permissions = require('./permissions.cjs');
const accountStatuses = require('./account-statuses.cjs');
const kycStatuses = require('./kyc-statuses.cjs');
const kycDocumentTypes = require('./kyc-document-types.cjs');
const tradeStates = require('./trade-states.cjs');
const tradeEvents = require('./trade-events.cjs');
const tradeActors = require('./trade-actors.cjs');
const signalClassifications = require('./signal-classifications.cjs');
const signalStatuses = require('./signal-statuses.cjs');
const orderTypes = require('./order-types.cjs');
const orderDirections = require('./order-directions.cjs');
const subscriptionStatuses = require('./subscription-statuses.cjs');
const subscriptionPlans = require('./subscription-plans.cjs');
const paymentStatuses = require('./payment-statuses.cjs');
const paymentProviders = require('./payment-providers.cjs');
const withdrawalStatuses = require('./withdrawal-statuses.cjs');
const referralStatuses = require('./referral-statuses.cjs');
const referralSettlementStatuses = require('./referral-settlement-statuses.cjs');
const ledgerEntryTypes = require('./ledger-entry-types.cjs');
const notificationTypes = require('./notification-types.cjs');
const notificationChannels = require('./notification-channels.cjs');
const jobTypes = require('./job-types.cjs');
const jobStatuses = require('./job-statuses.cjs');
const eventTypes = require('./event-types.cjs');
const brokerPlatforms = require('./broker-platforms.cjs');
const accountTypes = require('./account-types.cjs');
const sourceTypes = require('./source-types.cjs');
const providerCertificationStatuses = require('./provider-certification-statuses.cjs');
const marketplaceCategories = require('./marketplace-categories.cjs');
const tradingStyles = require('./trading-styles.cjs');
const solanaNetworks = require('./solana-networks.cjs');
const solanaTokens = require('./solana-tokens.cjs');
const solanaAttestationTypes = require('./solana-attestation-types.cjs');
const solanaPaymentStatuses = require('./solana-payment-statuses.cjs');

// Feature A
const solanaActions = require('./solana-actions/index.cjs');

// Feature B
const proofOfAlpha = require('./proof-of-alpha/index.cjs');

// Feature C
const cryptoPairs = require('./crypto-pairs/index.cjs');

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
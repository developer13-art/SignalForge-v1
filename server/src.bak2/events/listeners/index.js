/**
 * Listeners Index
 *
 * Central registration of every event listener in the platform. Called
 * during bootstrap to attach all listeners to the event bus.
 *
 * @module server/events/listeners
 */
const { registerMessageReceivedListener } = require('./message-received.listener');
const { registerMessageClassifiedListener } = require('./message-classified.listener');
const { registerSignalDetectedListener } = require('./signal-detected.listener');
const { registerSignalAnalyzedListener } = require('./signal-analyzed.listener');
const { registerSignalValidatedListener } = require('./signal-validated.listener');
const { registerProviderDnaLearnedListener } = require('./provider-dna-learned.listener');
const { registerRiskApprovedListener } = require('./risk-approved.listener');
const { registerRiskRejectedListener } = require('./risk-rejected.listener');
const { registerTradeExecutedListener } = require('./trade-executed.listener');
const { registerTradeClosedListener } = require('./trade-closed.listener');
const { registerSubscriptionCreatedListener } = require('./subscription-created.listener');
const { registerPaymentCompletedListener } = require('./payment-completed.listener');
const { registerKycApprovedListener } = require('./kyc-approved.listener');
const { registerReferralSettledListener } = require('./referral-settled.listener');
const { registerNotificationSentListener } = require('./notification-sent.listener');
const { registerSolanaAttestationAnchoredListener } = require('./solana-attestation-anchored.listener');
function registerAllListeners() {
  registerMessageReceivedListener();
  registerMessageClassifiedListener();
  registerSignalDetectedListener();
  registerSignalAnalyzedListener();
  registerSignalValidatedListener();
  registerProviderDnaLearnedListener();
  registerRiskApprovedListener();
  registerRiskRejectedListener();
  registerTradeExecutedListener();
  registerTradeClosedListener();
  registerSubscriptionCreatedListener();
  registerPaymentCompletedListener();
  registerKycApprovedListener();
  registerReferralSettledListener();
  registerNotificationSentListener();
  registerSolanaAttestationAnchoredListener();
}
module.exports.registerAllListeners = registerAllListeners;

/**
 * Listeners Index
 *
 * Central registration of every event listener in the platform. Called
 * during bootstrap to attach all listeners to the event bus.
 *
 * @module server/events/listeners
 */

import { registerMessageReceivedListener } from './message-received.listener';
import { registerMessageClassifiedListener } from './message-classified.listener';
import { registerSignalDetectedListener } from './signal-detected.listener';
import { registerSignalAnalyzedListener } from './signal-analyzed.listener';
import { registerSignalValidatedListener } from './signal-validated.listener';
import { registerProviderDnaLearnedListener } from './provider-dna-learned.listener';
import { registerRiskApprovedListener } from './risk-approved.listener';
import { registerRiskRejectedListener } from './risk-rejected.listener';
import { registerTradeExecutedListener } from './trade-executed.listener';
import { registerTradeClosedListener } from './trade-closed.listener';
import { registerSubscriptionCreatedListener } from './subscription-created.listener';
import { registerPaymentCompletedListener } from './payment-completed.listener';
import { registerKycApprovedListener } from './kyc-approved.listener';
import { registerReferralSettledListener } from './referral-settled.listener';
import { registerNotificationSentListener } from './notification-sent.listener';
import { registerSolanaAttestationAnchoredListener } from './solana-attestation-anchored.listener';

export function registerAllListeners() {
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
/**
 * Register All Jobs
 *
 * Convenience module that registers every job handler with the
 * registry. Called during bootstrap.
 *
 * @module server/jobs/register-all
 */

import { registerProcessTelegramMessageJob } from './job-types/process-telegram-message.job';
import { registerProcessDiscordMessageJob } from './job-types/process-discord-message.job';
import { registerProcessWhatsAppMessageJob } from './job-types/process-whatsapp-message.job';
import { registerProcessEmailMessageJob } from './job-types/process-email-message.job';
import { registerProcessTradingViewWebhookJob } from './job-types/process-tradingview-webhook.job';
import { registerClassifyMessageJob } from './job-types/classify-message.job';
import { registerParseSignalJob } from './job-types/parse-signal.job';
import { registerUpdateProviderDnaJob } from './job-types/update-provider-dna.job';
import { registerValidateSignalJob } from './job-types/validate-signal.job';
import { registerComputeConsensusJob } from './job-types/compute-consensus.job';
import { registerFanOutSignalJob } from './job-types/fan-out-signal.job';
import { registerExecuteTradeJob } from './job-types/execute-trade.job';
import { registerSyncBrokerAccountJob } from './job-types/sync-broker-account.job';
import { registerSnapshotAccountJob } from './job-types/snapshot-account.job';
import { registerCalculatePerformanceJob } from './job-types/calculate-performance.job';
import { registerMonthlyReferralSettlementJob } from './job-types/monthly-referral-settlement.job';
import { registerSendNotificationJob } from './job-types/send-notification.job';
import { registerGenerateAnalyticsJob } from './job-types/generate-analytics.job';
import { registerGenerateReportJob } from './job-types/generate-report.job';
import { registerAnchorProvenanceJob } from './job-types/anchor-provenance.job';
import { registerAnchorAttestationJob } from './job-types/anchor-attestation.job';
import { registerVerifySolanaPaymentJob } from './job-types/verify-solana-payment.job';
import { registerIndexSolanaEventsJob } from './job-types/index-solana-events.job';
import { registerRetryFailedExecutionJob } from './job-types/retry-failed-execution.job';
import { registerKycExpiryCheckJob } from './job-types/kyc-expiry-check.job';
import { registerSubscriptionExpiryCheckJob } from './job-types/subscription-expiry-check.job';
import { registerSessionCleanupJob } from './job-types/session-cleanup.job';
import { registerAuditCleanupJob } from './job-types/audit-cleanup.job';
import { registerDbVacuumJob } from './job-types/db-vacuum.job';

export function registerAllJobs() {
  registerProcessTelegramMessageJob();
  registerProcessDiscordMessageJob();
  registerProcessWhatsAppMessageJob();
  registerProcessEmailMessageJob();
  registerProcessTradingViewWebhookJob();
  registerClassifyMessageJob();
  registerParseSignalJob();
  registerUpdateProviderDnaJob();
  registerValidateSignalJob();
  registerComputeConsensusJob();
  registerFanOutSignalJob();
  registerExecuteTradeJob();
  registerSyncBrokerAccountJob();
  registerSnapshotAccountJob();
  registerCalculatePerformanceJob();
  registerMonthlyReferralSettlementJob();
  registerSendNotificationJob();
  registerGenerateAnalyticsJob();
  registerGenerateReportJob();
  registerAnchorProvenanceJob();
  registerAnchorAttestationJob();
  registerVerifySolanaPaymentJob();
  registerIndexSolanaEventsJob();
  registerRetryFailedExecutionJob();
  registerKycExpiryCheckJob();
  registerSubscriptionExpiryCheckJob();
  registerSessionCleanupJob();
  registerAuditCleanupJob();
  registerDbVacuumJob();
}
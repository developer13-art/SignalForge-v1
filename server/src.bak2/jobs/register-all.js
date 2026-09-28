/**
 * Register All Jobs
 *
 * Convenience module that registers every job handler with the
 * registry. Called during bootstrap.
 *
 * @module server/jobs/register-all
 */
const { registerProcessTelegramMessageJob } = require('./job-types/process-telegram-message.job');
const { registerProcessDiscordMessageJob } = require('./job-types/process-discord-message.job');
const { registerProcessWhatsAppMessageJob } = require('./job-types/process-whatsapp-message.job');
const { registerProcessEmailMessageJob } = require('./job-types/process-email-message.job');
const { registerProcessTradingViewWebhookJob } = require('./job-types/process-tradingview-webhook.job');
const { registerClassifyMessageJob } = require('./job-types/classify-message.job');
const { registerParseSignalJob } = require('./job-types/parse-signal.job');
const { registerUpdateProviderDnaJob } = require('./job-types/update-provider-dna.job');
const { registerValidateSignalJob } = require('./job-types/validate-signal.job');
const { registerComputeConsensusJob } = require('./job-types/compute-consensus.job');
const { registerFanOutSignalJob } = require('./job-types/fan-out-signal.job');
const { registerExecuteTradeJob } = require('./job-types/execute-trade.job');
const { registerSyncBrokerAccountJob } = require('./job-types/sync-broker-account.job');
const { registerSnapshotAccountJob } = require('./job-types/snapshot-account.job');
const { registerCalculatePerformanceJob } = require('./job-types/calculate-performance.job');
const { registerMonthlyReferralSettlementJob } = require('./job-types/monthly-referral-settlement.job');
const { registerSendNotificationJob } = require('./job-types/send-notification.job');
const { registerGenerateAnalyticsJob } = require('./job-types/generate-analytics.job');
const { registerGenerateReportJob } = require('./job-types/generate-report.job');
const { registerAnchorProvenanceJob } = require('./job-types/anchor-provenance.job');
const { registerAnchorAttestationJob } = require('./job-types/anchor-attestation.job');
const { registerVerifySolanaPaymentJob } = require('./job-types/verify-solana-payment.job');
const { registerIndexSolanaEventsJob } = require('./job-types/index-solana-events.job');
const { registerRetryFailedExecutionJob } = require('./job-types/retry-failed-execution.job');
const { registerKycExpiryCheckJob } = require('./job-types/kyc-expiry-check.job');
const { registerSubscriptionExpiryCheckJob } = require('./job-types/subscription-expiry-check.job');
const { registerSessionCleanupJob } = require('./job-types/session-cleanup.job');
const { registerAuditCleanupJob } = require('./job-types/audit-cleanup.job');
const { registerDbVacuumJob } = require('./job-types/db-vacuum.job');
function registerAllJobs() {
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
module.exports.registerAllJobs = registerAllJobs;

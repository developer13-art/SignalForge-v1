'use strict';

/**
 * SignalForge - Job Registry
 *
 * Maps a job type to its handler so the scheduler can look up the
 * handler by string. New features register their jobs here; the
 * scheduler itself never needs to know the specific job names.
 */

const processTelegramMessage = require('./job-types/process-telegram-message.job');
const classifyMessage = require('./job-types/classify-message.job');
const parseSignal = require('./job-types/parse-signal.job');
const validateSignal = require('./job-types/validate-signal.job');
const fanOutSignal = require('./job-types/fan-out-signal.job');
const executeTrade = require('./job-types/execute-trade.job');
const syncBrokerAccount = require('./job-types/sync-broker-account.job');
const snapshotAccount = require('./job-types/snapshot-account.job');
const calculatePerformance = require('./job-types/calculate-performance.job');
const monthlyReferralSettlement = require('./job-types/monthly-referral-settlement.job');
const sendNotification = require('./job-types/send-notification.job');
const generateAnalytics = require('./job-types/generate-analytics.job');

const processBlinks = require('./job-types/process-blink-confirmation.job');
const reconcileBlinks = require('./job-types/reconcile-blink-payments.job');
const writeProof = require('./job-types/write-proof-of-alpha.job');
const verifyProof = require('./job-types/verify-proof-of-alpha.job');
const refreshLeaderboard = require('./job-types/refresh-leaderboard-cache.job');
const routeCrypto = require('./job-types/route-crypto-execution.job');
const confirmDexSwap = require('./job-types/confirm-dex-swap.job');
const syncCryptoPositions = require('./job-types/sync-crypto-positions.job');
const refreshCryptoMarketData = require('./job-types/refresh-crypto-market-data.job');
const reconcileExecutionRoutes = require('./job-types/reconcile-execution-routes.job');
const syncPools = require('./job-types/sync-pools.job');
const syncTokens = require('./job-types/sync-tokens.job');

const REGISTRY = {
  // Existing jobs.
  PROCESS_TELEGRAM_MESSAGE: processTelegramMessage,
  CLASSIFY_MESSAGE: classifyMessage,
  PARSE_SIGNAL: parseSignal,
  VALIDATE_SIGNAL: validateSignal,
  FAN_OUT_SIGNAL: fanOutSignal,
  EXECUTE_TRADE: executeTrade,
  SYNC_BROKER_ACCOUNT: syncBrokerAccount,
  SNAPSHOT_ACCOUNT: snapshotAccount,
  CALCULATE_PERFORMANCE: calculatePerformance,
  MONTHLY_REFERRAL_SETTLEMENT: monthlyReferralSettlement,
  SEND_NOTIFICATION: sendNotification,
  GENERATE_ANALYTICS: generateAnalytics,

  // Feature A — Solana Actions & Blinks.
  PROCESS_BLINK_CONFIRMATION: processBlinks,
  RECONCILE_BLINK_PAYMENTS: reconcileBlinks,

  // Feature B — Proof of Alpha.
  WRITE_PROOF_OF_ALPHA: writeProof,
  VERIFY_PROOF_OF_ALPHA: verifyProof,
  REFRESH_LEADERBOARD_CACHE: refreshLeaderboard,

  // Feature C — Hybrid Execution Engine.
  ROUTE_CRYPTO_EXECUTION: routeCrypto,
  CONFIRM_DEX_SWAP: confirmDexSwap,
  SYNC_CRYPTO_POSITIONS: syncCryptoPositions,
  REFRESH_CRYPTO_MARKET_DATA: refreshCryptoMarketData,
  RECONCILE_EXECUTION_ROUTES: reconcileExecutionRoutes,
  SYNC_POOLS: syncPools,
  SYNC_TOKENS: syncTokens,
};

function getHandler(jobType) {
  if (!jobType) {
    return null;
  }
  return REGISTRY[jobType] || null;
}

function listJobTypes() {
  return Object.keys(REGISTRY);
}

function isRegistered(jobType) {
  return Boolean(getHandler(jobType));
}

module.exports = {
  REGISTRY,
  getHandler,
  listJobTypes,
  isRegistered,
};
'use strict';

/**
 * SignalForge - Proof of Alpha Constants
 *
 * Canonical constants for the Proof of Alpha subsystem. Every
 * on-chain proof record written by SignalForge must carry a version
 * from this file so that parsing and verification remain forward
 * compatible.
 */

const PROOF_MEMO_VERSION = 1;

const PROOF_MEMO_PREFIX = 'SFA-PROOF';

const PROOF_KINDS = Object.freeze({
  TRADE_CLOSED: 'trade_closed',
  PROVIDER_CERTIFIED: 'provider_certified',
  PROVIDER_MILESTONE: 'provider_milestone',
  PERFORMANCE_PERIOD: 'performance_period',
});

const PROOF_STATUSES = Object.freeze({
  PENDING: 'pending',
  SUBMITTING: 'submitting',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired',
});

const PROOF_VERIFICATION_LEVELS = Object.freeze({
  UNVERIFIED: 'unverified',
  PARTIAL: 'partial',
  VERIFIED: 'verified',
  ON_CHAIN_CONFIRMED: 'on_chain_confirmed',
});

const PROOF_MAX_MEMO_BYTES = 566;

const PROOF_MAX_BATCH_SIZE = 100;

const PROOF_MIN_TRADE_AMOUNT_USD = 0;

const PROOF_MAX_TRADES_PER_DAY_PER_PROVIDER = 5000;

const PROOF_SIGNIFICANCE_THRESHOLD = Object.freeze({
  MIN_PNL_ABSOLUTE: 0,
  MIN_PNL_PERCENT: 0,
  INCLUDE_LOSING_TRADES: true,
  MIN_PROVIDER_TRADES_FOR_CERTIFICATION: 100,
});

const PROOF_LEADERBOARD_WINDOWS = Object.freeze({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL: 'all',
});

const PROOF_LEADERBOARD_SORTS = Object.freeze({
  TOTAL_PNL: 'total_pnl',
  WIN_RATE: 'win_rate',
  PROFIT_FACTOR: 'profit_factor',
  AVERAGE_RR: 'average_rr',
  CONSISTENCY: 'consistency',
  SHARPE: 'sharpe',
  VERIFIED_TRADES: 'verified_trades',
});

const PROOF_LEADERBOARD_DEFAULT_LIMIT = 50;

const PROOF_LEADERBOARD_MAX_LIMIT = 200;

const PROOF_MEMO_FIELDS = Object.freeze({
  VERSION: 'v',
  KIND: 'k',
  PROVIDER_ID: 'p',
  TRADE_ID: 't',
  SYMBOL: 's',
  DIRECTION: 'd',
  PNL_USD: 'u',
  PNL_PERCENT: 'r',
  RESULT: 'o',
  OPENED_AT: 'oa',
  CLOSED_AT: 'ca',
  CONFIDENCE: 'c',
  SIGNAL_ID: 'sig',
  ISSUED_AT: 'i',
});

const PROOF_RESULT_VALUES = Object.freeze({
  WIN: 'W',
  LOSS: 'L',
  BREAK_EVEN: 'B',
});

const PROOF_ERROR_CODES = Object.freeze({
  INVALID_MEMO: 'INVALID_MEMO',
  MEMO_TOO_LARGE: 'MEMO_TOO_LARGE',
  SIGNER_UNAVAILABLE: 'SIGNER_UNAVAILABLE',
  RPC_UNAVAILABLE: 'RPC_UNAVAILABLE',
  SUBMISSION_FAILED: 'SUBMISSION_FAILED',
  CONFIRMATION_FAILED: 'CONFIRMATION_FAILED',
  PROOF_NOT_FOUND: 'PROOF_NOT_FOUND',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  INVALID_PROVIDER: 'INVALID_PROVIDER',
  INVALID_TRADE: 'INVALID_TRADE',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

const PROOF_LOG_CONTEXT = 'proof-of-alpha';

const PROOF_METRICS = Object.freeze({
  MEMOS_SUBMITTED: 'proof_memos_submitted_total',
  MEMOS_CONFIRMED: 'proof_memos_confirmed_total',
  MEMOS_FAILED: 'proof_memos_failed_total',
  SUBMISSION_LATENCY_MS: 'proof_submission_latency_ms',
  CONFIRMATION_LATENCY_MS: 'proof_confirmation_latency_ms',
  VERIFICATION_REQUESTS: 'proof_verification_requests_total',
  LEADERBOARD_REQUESTS: 'proof_leaderboard_requests_total',
});

const PROOF_CONFIRMATION_TIMEOUT_MS = 90000;
const PROOF_CONFIRMATION_POLL_INTERVAL_MS = 3000;
const PROOF_CONFIRMATION_MAX_POLL_ATTEMPTS = 30;

const PROOF_RETRY_BACKOFF_MS = Object.freeze([2000, 5000, 15000, 30000, 60000]);

const PROOF_MAX_RETRY_ATTEMPTS = 5;

const PROOF_MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

const PROOF_PDA_SEEDS = Object.freeze({
  PROVIDER_ROOT: 'provider_root',
  TRADE_PROOF: 'trade_proof',
  MILESTONE: 'milestone',
});

module.exports = Object.freeze({
  PROOF_MEMO_VERSION,
  PROOF_MEMO_PREFIX,
  PROOF_KINDS,
  PROOF_STATUSES,
  PROOF_VERIFICATION_LEVELS,
  PROOF_MAX_MEMO_BYTES,
  PROOF_MAX_BATCH_SIZE,
  PROOF_MIN_TRADE_AMOUNT_USD,
  PROOF_MAX_TRADES_PER_DAY_PER_PROVIDER,
  PROOF_SIGNIFICANCE_THRESHOLD,
  PROOF_LEADERBOARD_WINDOWS,
  PROOF_LEADERBOARD_SORTS,
  PROOF_LEADERBOARD_DEFAULT_LIMIT,
  PROOF_LEADERBOARD_MAX_LIMIT,
  PROOF_MEMO_FIELDS,
  PROOF_RESULT_VALUES,
  PROOF_ERROR_CODES,
  PROOF_LOG_CONTEXT,
  PROOF_METRICS,
  PROOF_CONFIRMATION_TIMEOUT_MS,
  PROOF_CONFIRMATION_POLL_INTERVAL_MS,
  PROOF_CONFIRMATION_MAX_POLL_ATTEMPTS,
  PROOF_RETRY_BACKOFF_MS,
  PROOF_MAX_RETRY_ATTEMPTS,
  PROOF_MEMO_PROGRAM_ID,
  PROOF_PDA_SEEDS,
});
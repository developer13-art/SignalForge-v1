'use strict';

/**
 * SignalForge - DEX Gateway Shared Constants
 *
 * Constants shared by every DEX and perpetual gateway. This module is
 * the single source of truth for gateway-neutral values such as quote
 * statuses, transaction lifecycle stages, and shared metric names.
 */

const GATEWAY_OPERATIONS = Object.freeze({
  QUOTE: 'quote',
  BUILD_SWAP: 'build_swap',
  SUBMIT: 'submit',
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  MODIFY: 'modify',
  POSITIONS: 'positions',
  HEALTH: 'health',
});

const QUOTE_STATUSES = Object.freeze({
  FRESH: 'fresh',
  STALE: 'stale',
  EXPIRED: 'expired',
  CONSUMED: 'consumed',
  CANCELLED: 'cancelled',
});

const TRANSACTION_STAGES = Object.freeze({
  PENDING: 'pending',
  BUILT: 'built',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
});

const SLIPPAGE_POLICY = Object.freeze({
  STATIC: 'static',
  DYNAMIC: 'dynamic',
  AUTO: 'auto',
});

const FEE_MODES = Object.freeze({
  FIXED: 'fixed',
  MARKET: 'market',
  AUTO: 'auto',
});

const PRIORITY_FEE_LEVELS = Object.freeze({
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
});

const SIGNATURE_STATES = Object.freeze({
  UNSIGNED: 'unsigned',
  PARTIALLY_SIGNED: 'partially_signed',
  FULLY_SIGNED: 'fully_signed',
  SUBMITTED: 'submitted',
});

const TOKEN_PROGRAM_IDS = Object.freeze({
  SPL_TOKEN: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TOKEN_2022: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
  ASSOCIATED_TOKEN: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  SYSTEM: '11111111111111111111111111111111',
  MEMO: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
});

const COMMITMENT_LEVELS = Object.freeze({
  PROCESSED: 'processed',
  CONFIRMED: 'confirmed',
  FINALIZED: 'finalized',
});

const SHARED_DEX_MINTS = Object.freeze({
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  SOL: 'So11111111111111111111111111111111111111112',
  WSOL: 'So11111111111111111111111111111111111111112',
});

const SHARED_TOKEN_DECIMALS = Object.freeze({
  USDC: 6,
  USDT: 6,
  SOL: 9,
  WSOL: 9,
});

const SHARED_DEFAULTS = Object.freeze({
  SLIPPAGE_BPS: 50,
  MAX_SLIPPAGE_BPS: 5000,
  PRIORITY_FEE_MICRO_LAMPORTS: 50000,
  MAX_PRIORITY_FEE_MICRO_LAMPORTS: 10000000,
  COMPUTE_UNITS: 1400000,
  MAX_COMPUTE_UNITS: 1400000,
  MIN_COMPUTE_UNITS: 200000,
  PRICE_IMPACT_PCT: 5,
  QUOTE_TTL_SECONDS: 30,
  CONFIRMATION_TIMEOUT_MS: 90000,
  CONFIRMATION_POLL_INTERVAL_MS: 2500,
  CONFIRMATION_MAX_POLL_ATTEMPTS: 36,
});

const SHARED_ERROR_CODES = Object.freeze({
  INVALID_REQUEST: 'SHARED_INVALID_REQUEST',
  UNSUPPORTED_OPERATION: 'SHARED_UNSUPPORTED_OPERATION',
  QUOTE_NOT_FOUND: 'SHARED_QUOTE_NOT_FOUND',
  QUOTE_EXPIRED: 'SHARED_QUOTE_EXPIRED',
  QUOTE_ALREADY_CONSUMED: 'SHARED_QUOTE_ALREADY_CONSUMED',
  TRANSACTION_BUILD_FAILED: 'SHARED_TRANSACTION_BUILD_FAILED',
  TRANSACTION_INVALID: 'SHARED_TRANSACTION_INVALID',
  TRANSACTION_SIGNATURE_MISMATCH: 'SHARED_TRANSACTION_SIGNATURE_MISMATCH',
  TRANSACTION_ALREADY_SUBMITTED: 'SHARED_TRANSACTION_ALREADY_SUBMITTED',
  CONFIRMATION_TIMEOUT: 'SHARED_CONFIRMATION_TIMEOUT',
  GATEWAY_UNAVAILABLE: 'SHARED_GATEWAY_UNAVAILABLE',
  GATEWAY_NOT_REGISTERED: 'SHARED_GATEWAY_NOT_REGISTERED',
  GATEWAY_DISABLED: 'SHARED_GATEWAY_DISABLED',
  ROUTE_COMPARISON_FAILED: 'SHARED_ROUTE_COMPARISON_FAILED',
  TOKEN_NOT_FOUND: 'SHARED_TOKEN_NOT_FOUND',
  PRICE_UNAVAILABLE: 'SHARED_PRICE_UNAVAILABLE',
  INTERNAL_ERROR: 'SHARED_INTERNAL_ERROR',
});

const SHARED_LOG_CONTEXT = 'dex-shared';

const SHARED_METRICS = Object.freeze({
  QUOTES_CREATED: 'dex_quotes_created_total',
  QUOTES_EXPIRED: 'dex_quotes_expired_total',
  TRANSACTIONS_BUILT: 'dex_transactions_built_total',
  TRANSACTIONS_SUBMITTED: 'dex_transactions_submitted_total',
  TRANSACTIONS_CONFIRMED: 'dex_transactions_confirmed_total',
  TRANSACTIONS_FAILED: 'dex_transactions_failed_total',
  SIGNATURES_VERIFIED: 'dex_signatures_verified_total',
  SIGNATURES_REJECTED: 'dex_signatures_rejected_total',
  ROUTES_COMPARED: 'dex_routes_compared_total',
  GATEWAY_LATENCY_MS: 'dex_gateway_latency_ms',
});

const SHARED_SIGNATURE_VERIFICATION_MODES = Object.freeze({
  NONE: 'none',
  SIGNER_CHECK: 'signer_check',
  SIGNATURE_CHECK: 'signature_check',
  FULL: 'full',
});

const SHARED_PRIORITY_FEE_MODES = Object.freeze({
  STATIC: 'static',
  MARKET: 'market',
  AUTO: 'auto',
});

const SHARED_NONCE_STRATEGIES = Object.freeze({
  LATEST_BLOCKHASH: 'latest_blockhash',
  DURABLE_NONCE: 'durable_nonce',
});

module.exports = Object.freeze({
  GATEWAY_OPERATIONS,
  QUOTE_STATUSES,
  TRANSACTION_STAGES,
  SLIPPAGE_POLICY,
  FEE_MODES,
  PRIORITY_FEE_LEVELS,
  SIGNATURE_STATES,
  TOKEN_PROGRAM_IDS,
  COMMITMENT_LEVELS,
  SHARED_DEX_MINTS,
  SHARED_TOKEN_DECIMALS,
  SHARED_DEFAULTS,
  SHARED_ERROR_CODES,
  SHARED_LOG_CONTEXT,
  SHARED_METRICS,
  SHARED_SIGNATURE_VERIFICATION_MODES,
  SHARED_PRIORITY_FEE_MODES,
  SHARED_NONCE_STRATEGIES,
});
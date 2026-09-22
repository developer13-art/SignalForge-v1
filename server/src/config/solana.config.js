/**
 * Solana Configuration
 *
 * Configures the Solana integration layer, including the RPC
 * connection, Anchor programs for attestation, provenance, and
 * payments, and the treasury wallet.
 *
 * @module signalforge/server/config/solana
 */

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

const solanaConfig = Object.freeze({
  enabled: toBoolean(process.env.FEATURE_SOLANA, true),
  network: process.env.SOLANA_NETWORK || 'devnet',
  rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  wsUrl: process.env.SOLANA_WS_URL || 'wss://api.devnet.solana.com',
  commitment: process.env.SOLANA_COMMITMENT || 'confirmed',

  programs: {
    attestation: process.env.SOLANA_ATTESTATION_PROGRAM_ID || null,
    provenance: process.env.SOLANA_PROVENANCE_PROGRAM_ID || null,
    payment: process.env.SOLANA_PAYMENT_PROGRAM_ID || null,
  },

  treasury: {
    wallet: process.env.SOLANA_TREASURY_WALLET || null,
    adminKeypairPath: process.env.SOLANA_ADMIN_KEYPAIR_PATH || null,
  },

  payments: {
    enabled: toBoolean(process.env.SOLANA_PAYMENTS_ENABLED, true),
    acceptedTokens: ['SOL', 'USDC', 'USDT'],
    defaultToken: process.env.SOLANA_DEFAULT_TOKEN || 'USDC',
    paymentTokenMint: process.env.SOLANA_PAYMENT_TOKEN_MINT || null,
    paymentExpiryMinutes: toNumber(process.env.SOLANA_PAYMENT_EXPIRY_MINUTES, 30),
    minConfirmations: toNumber(process.env.SOLANA_MIN_CONFIRMATIONS, 1),
    maxConfirmations: toNumber(process.env.SOLANA_MAX_CONFIRMATIONS, 32),
  },

  transactions: {
    confirmationTimeoutMs: toNumber(
      process.env.SOLANA_CONFIRMATION_TIMEOUT_MS,
      60000,
    ),
    commitmentLevel: process.env.SOLANA_TX_COMMITMENT || 'confirmed',
    skipPreflight: toBoolean(process.env.SOLANA_SKIP_PREFLIGHT, false),
    maxRetries: toNumber(process.env.SOLANA_RETRY_ATTEMPTS, 3),
    priorityFeeMicroLamports: toNumber(
      process.env.SOLANA_PRIORITY_FEE_MICRO_LAMPORTS,
      1000,
    ),
  },

  indexer: {
    enabled: toBoolean(process.env.SOLANA_INDEXER_ENABLED, true),
    batchSize: toNumber(process.env.SOLANA_INDEXER_BATCH_SIZE, 100),
    pollIntervalMs: toNumber(process.env.SOLANA_INDEXER_POLL_INTERVAL_MS, 5000),
    checkpointIntervalMs: toNumber(
      process.env.SOLANA_INDEXER_CHECKPOINT_INTERVAL_MS,
      30000,
    ),
  },

  wallets: {
    signInWithSolana: toBoolean(process.env.SOLANA_SIWS_ENABLED, true),
    nonceExpiryMinutes: toNumber(process.env.SOLANA_NONCE_EXPIRY_MINUTES, 5),
    maxWalletsPerUser: toNumber(process.env.SOLANA_MAX_WALLETS_PER_USER, 5),
  },

  attestations: {
    enabled: true,
    autoAnchorCertification: toBoolean(
      process.env.SOLANA_AUTO_ANCHOR_CERTIFICATION,
      true,
    ),
    autoAnchorReputation: toBoolean(
      process.env.SOLANA_AUTO_ANCHOR_REPUTATION,
      true,
    ),
    anchorIntervalHours: toNumber(process.env.SOLANA_ANCHOR_INTERVAL_HOURS, 24),
  },

  provenance: {
    enabled: true,
    autoAnchor: toBoolean(process.env.SOLANA_AUTO_ANCHOR_PROVENANCE, true),
    anchorOnParse: toBoolean(process.env.SOLANA_ANCHOR_ON_PARSE, true),
    anchorOnExecution: toBoolean(process.env.SOLANA_ANCHOR_ON_EXECUTION, false),
    anchorOnClose: toBoolean(process.env.SOLANA_ANCHOR_ON_CLOSE, false),
  },

  verification: {
    publicPageEnabled: toBoolean(process.env.SOLANA_PUBLIC_VERIFY_ENABLED, true),
    verifyOnRead: toBoolean(process.env.SOLANA_VERIFY_ON_READ, true),
    cacheTtlSeconds: toNumber(process.env.SOLANA_VERIFY_CACHE_TTL, 300),
  },

  retry: {
    maxAttempts: toNumber(process.env.SOLANA_RETRY_ATTEMPTS, 3),
    baseDelayMs: toNumber(process.env.SOLANA_RETRY_BASE_DELAY_MS, 2000),
    maxDelayMs: toNumber(process.env.SOLANA_RETRY_MAX_DELAY_MS, 15000),
  },

  logs: {
    logTransactions: toBoolean(process.env.SOLANA_LOG_TRANSACTIONS, true),
    redactSensitive: true,
  },
});

export default solanaConfig;
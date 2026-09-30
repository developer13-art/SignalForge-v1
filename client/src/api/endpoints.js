'use strict';

/**
 * SignalForge - API Endpoints Registry
 *
 * Every API endpoint the client application uses, grouped by domain.
 * New features add their endpoints to this file so that API calls
 * remain centralized and easy to audit.
 */

const API_ENDPOINTS = Object.freeze({
  // -------------------- Authentication --------------------
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    verifyPhone: '/auth/verify-phone',
    twoFactorSetup: '/auth/2fa/setup',
    twoFactorVerify: '/auth/2fa/verify',
    session: '/auth/session',
  },

  // -------------------- Users --------------------
  users: {
    me: '/users/me',
    profile: '/users/me/profile',
    preferences: '/users/me/preferences',
    sessions: '/users/me/sessions',
    devices: '/users/me/devices',
  },

  // -------------------- KYC --------------------
  kyc: {
  status: '/kyc/status',
  application: '/kyc/applications/me',
  createApplication: '/kyc/applications',
  documentTypes: '/kyc/document-types',
  submitPersonalInfo: (applicationId) => `/kyc/applications/${applicationId}/personal-info`,
  updateDocumentType: (applicationId) => `/kyc/applications/${applicationId}/document-type`,
  uploadDocument: (applicationId) => `/kyc/applications/${applicationId}/documents`,
  uploadSelfie: (applicationId) => `/kyc/applications/${applicationId}/selfie`,
  submitApplication: (applicationId) => `/kyc/applications/${applicationId}/submit`,
  resubmit: (applicationId) => `/kyc/applications/${applicationId}/resubmit`,
  documents: (applicationId) => `/kyc/applications/${applicationId}/documents`,
  document: (applicationId, documentId) =>
    `/kyc/applications/${applicationId}/documents/${documentId}`,
  verificationResult: (applicationId) => `/kyc/applications/${applicationId}/verification`,
},

  // -------------------- Signal sources --------------------
  sources: {
    list: '/sources',
    create: '/sources',
    telegram: '/sources/telegram',
    telegramChannels: '/sources/telegram/channels',
    discord: '/sources/discord',
    whatsapp: '/sources/whatsapp',
    tradingView: '/sources/tradingview',
    email: '/sources/email',
    restApi: '/sources/rest-api',
  },

  // -------------------- Signals --------------------
  signals: {
    list: '/signals',
    details: '/signals/:signalId',
    history: '/signals/history',
    replay: '/signals/:signalId/replay',
  },

  // -------------------- Trading --------------------
  trading: {
    positions: '/trading/positions',
    orders: '/trading/orders',
    history: '/trading/history',
    trade: '/trading/:tradeId',
  },

  // -------------------- Brokers --------------------
  brokers: {
    accounts: '/brokers/accounts',
    connect: '/brokers/accounts/connect',
    disconnect: '/brokers/accounts/:accountId/disconnect',
    sync: '/brokers/accounts/:accountId/sync',
  },

  // -------------------- Analytics --------------------
  analytics: {
    overview: '/analytics/overview',
    performance: '/analytics/performance',
    equityCurve: '/analytics/equity-curve',
    trades: '/analytics/trades',
  },

  // -------------------- Subscriptions --------------------
  subscriptions: {
    plans: '/subscriptions/plans',
    me: '/subscriptions/me',
    checkout: '/subscriptions/checkout',
    cancel: '/subscriptions/me/cancel',
    usage: '/subscriptions/me/usage',
  },

  // -------------------- Payments --------------------
  payments: {
    methods: '/payments/methods',
    history: '/payments/history',
    invoices: '/payments/invoices',
  },

  // -------------------- Wallet & withdrawals --------------------
  wallets: {
    me: '/wallets/me',
    ledger: '/wallets/me/ledger',
  },
  withdrawals: {
    list: '/withdrawals',
    create: '/withdrawals',
    status: '/withdrawals/:withdrawalId',
  },

  // -------------------- Referrals --------------------
  referrals: {
    code: '/referrals/code',
    relationships: '/referrals/relationships',
    rewards: '/referrals/rewards',
    wallet: '/referrals/wallet',
    history: '/referrals/history',
    leaderboard: '/referrals/leaderboard',
  },

  // -------------------- Marketplace --------------------
  providers: {
    list: '/providers',
    details: '/providers/:providerId',
    subscribe: '/providers/:providerId/subscribe',
    reviews: '/providers/:providerId/reviews',
  },
  traders: {
    list: '/traders',
    details: '/traders/:traderId',
    follow: '/traders/:traderId/follow',
  },

  // -------------------- Feature A — Solana Actions & Blinks --------------------
  blinks: {
    list: '/solana/actions/blinks',
    create: '/solana/actions/blinks',
    details: '/solana/actions/blinks/:blinkId',
    update: '/solana/actions/blinks/:blinkId',
    pause: '/solana/actions/blinks/:blinkId/pause',
    resume: '/solana/actions/blinks/:blinkId/resume',
    archive: '/solana/actions/blinks/:blinkId/archive',
    share: '/solana/actions/blinks/:blinkId/share',
    shareLinks: '/solana/actions/blinks/:blinkId/share-links',
    shares: '/solana/actions/blinks/:blinkId/shares',
    analytics: '/solana/actions/blinks/:blinkId/analytics',
    funnel: '/solana/actions/blinks/:blinkId/funnel',
    stats: '/solana/actions/blinks/:blinkId/stats',
    topConversions: '/solana/actions/blinks/:blinkId/top-conversions',
    ownerStats: '/solana/actions/blinks/analytics/me',
    templates: '/solana/actions/blinks/templates',
    template: '/solana/actions/blinks/templates/:templateId',
  },
  solanaActions: {
    // Public spec endpoints.
    subscribe: '/api/actions/subscribe',
    upgrade: '/api/actions/upgrade',
    referral: '/api/actions/referral',
    tip: '/api/actions/tip',
  },

  // -------------------- Feature B — Proof of Alpha --------------------
  proofOfAlpha: {
    list: '/solana/proof-of-alpha/proofs',
    details: '/solana/proof-of-alpha/proofs/:proofId',
    bySignature: '/solana/proof-of-alpha/proofs/signature/:signature',
    verify: '/solana/proof-of-alpha/proofs/signature/:signature/verify',
    verifyOnChain: '/solana/proof-of-alpha/proofs/signature/:signature/on-chain',
    providerProofs: '/solana/proof-of-alpha/providers/:providerId/proofs',
    providerVerification:
      '/solana/proof-of-alpha/providers/:providerId/verification',
    leaderboard: '/solana/proof-of-alpha/leaderboard',
    leaderboardSummary: '/solana/proof-of-alpha/leaderboard/summary',
    leaderboardTop: '/solana/proof-of-alpha/leaderboard/top',
    leaderboardRefresh: '/solana/proof-of-alpha/leaderboard/refresh',
    leaderboardClear: '/solana/proof-of-alpha/leaderboard/clear-cache',
    leaderboardEntry: '/solana/proof-of-alpha/leaderboard/providers/:providerId',
    leaderboardBadge:
      '/solana/proof-of-alpha/leaderboard/providers/:providerId/badge',
  },

  // -------------------- Feature C — Execution Router --------------------
  executionRouter: {
    resolve: '/execution/router/resolve',
    simulate: '/execution/router/simulate',
    explain: '/execution/router/explain',
    gateways: '/execution/router/gateways',
    policies: '/execution/router/policies',
    policy: '/execution/router/policies/default',
    savePolicy: '/execution/router/policies',
    deletePolicy: '/execution/router/policies/:policyId',
    setDefaultPolicy: '/execution/router/policies/:policyId/default',
    routes: '/execution/router/routes',
    route: '/execution/router/routes/:routeId',
    routeLogs: '/execution/router/routes/:routeId/logs',
    usage: '/execution/router/usage',
    metrics: '/execution/router/metrics',
  },

  // -------------------- Feature C — Crypto Trading --------------------
  cryptoTrading: {
    positions: '/crypto-trading/positions',
    position: '/crypto-trading/positions/:positionId',
    closePosition: '/crypto-trading/positions/:positionId/close',
    orders: '/crypto-trading/orders',
    order: '/crypto-trading/orders/:orderId',
    cancelOrder: '/crypto-trading/orders/:orderId/cancel',
    history: '/crypto-trading/history',
    swaps: '/crypto-trading/swaps',
    swapQuote: '/crypto-trading/swap/quote',
    swapBuild: '/crypto-trading/swap/build',
    swapSubmit: '/crypto-trading/swap/submit',
    swapConfirm: '/crypto-trading/swap/confirm',
    wallet: '/crypto-trading/wallet',
    risk: '/crypto-trading/risk',
    automation: '/crypto-trading/automation',
    routeSimulate: '/crypto-trading/route/simulate',
    routeExplain: '/crypto-trading/route/explain',
    routeGateways: '/crypto-trading/route/gateways',
  },

  // -------------------- Feature C — Crypto Market Data --------------------
  cryptoMarketData: {
    health: '/crypto-trading/market-data/health',
    price: '/crypto-trading/market-data/prices/:symbol',
    pricesBatch: '/crypto-trading/market-data/prices/batch',
    historicalPrice: '/crypto-trading/market-data/prices/:symbol/historical',
    volatility: '/crypto-trading/market-data/prices/:symbol/volatility',
    liquidity: '/crypto-trading/market-data/liquidity/:symbol',
    poolLiquidity: '/crypto-trading/market-data/liquidity/pool/:poolId',
    liquidityTiers: '/crypto-trading/market-data/liquidity/tiers',
    volume: '/crypto-trading/market-data/volume/:symbol',
    volumeSummary: '/crypto-trading/market-data/volume/:symbol/summary',
    topVolume: '/crypto-trading/market-data/volume/top',
    pools: '/crypto-trading/market-data/pools',
    poolsByMints: '/crypto-trading/market-data/pools/by-mints',
    pool: '/crypto-trading/market-data/pools/:source/:address',
    tokens: '/crypto-trading/market-data/tokens',
    tokensByTag: '/crypto-trading/market-data/tokens/tag/:tag',
    token: '/crypto-trading/market-data/tokens/:mint',
    describeSymbol: '/crypto-trading/market-data/symbols/:symbol/describe',
  },

  // -------------------- Feature C — Crypto Symbols --------------------
  cryptoSymbols: {
    formats: '/crypto-trading/signals/formats',
    registry: '/crypto-trading/signals/registry',
    list: '/crypto-trading/signals/symbols',
    lookup: '/crypto-trading/signals/symbols/:canonical',
    describe: '/crypto-trading/signals/symbols/:symbol/describe',
    normalize: '/crypto-trading/signals/symbols/:symbol/normalize',
    classify: '/crypto-trading/signals/symbols/:symbol/classify',
    normalizeBatch: '/crypto-trading/signals/symbols/normalize/batch',
    fingerprint: '/crypto-trading/signals/fingerprint',
  },

  // -------------------- Admin --------------------
  admin: {
    overview: '/admin/overview',
    users: '/admin/users',
    kyc: '/admin/kyc',
    providers: '/admin/providers',
    trades: '/admin/trades',
    auditLogs: '/admin/audit-logs',
    settings: '/admin/settings',
  },

  // -------------------- Compliance --------------------
  compliance: {
    dashboard: '/compliance/dashboard',
    kycQueue: '/compliance/kyc-queue',
  },

  // -------------------- Executive --------------------
  executive: {
    dashboard: '/executive/dashboard',
  },
});

function resolveEndpoint(path, params = {}) {
  if (!path) {
    return path;
  }
  let resolved = path;
  for (const [key, value] of Object.entries(params)) {
    resolved = resolved.replace(`:${key}`, encodeURIComponent(value));
  }
  return resolved;
}

function findEndpoint(group, key) {
  const target = API_ENDPOINTS[group];
  if (!target) {
    return null;
  }
  return target[key] || null;
}

export { API_ENDPOINTS, resolveEndpoint, findEndpoint };
export const endpoints = API_ENDPOINTS;
export default API_ENDPOINTS;
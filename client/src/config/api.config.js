/**
 * API Configuration
 *
 * Resolves the backend API base URL, timeouts, retry policy, and
 * header defaults from Vite environment variables.
 *
 * @module client/src/config/api.config
 */

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiConfig = Object.freeze({
  baseUrl: rawApiUrl.replace(/\/+$/, ''),
  wsUrl: (import.meta.env.VITE_WS_URL || 'http://localhost:4000').replace(/\/+$/, ''),
  timeoutMs: 30000,
  uploadTimeoutMs: 120000,
  retries: 2,
  retryDelayMs: 1000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  endpoints: {
    auth: '/auth',
    users: '/users',
    rbac: '/rbac',
    kyc: '/kyc',
    sources: '/signal-sources',
    telegram: '/signal-sources/telegram',
    discord: '/signal-sources/discord',
    whatsapp: '/signal-sources/whatsapp',
    tradingview: '/signal-sources/tradingview',
    email: '/signal-sources/email',
    restApi: '/signal-sources/rest-api',
    messages: '/messages',
    signals: '/signals',
    ai: '/ai',
    providerDna: '/provider-dna',
    consensus: '/consensus',
    risk: '/risk',
    automation: '/automation',
    execution: '/execution',
    copyTrading: '/copy-trading',
    brokers: '/brokers',
    trades: '/trades',
    analytics: '/analytics',
    performance: '/performance',
    subscriptions: '/subscriptions',
    payments: '/payments',
    wallets: '/wallets',
    withdrawals: '/withdrawals',
    referrals: '/referrals',
    providers: '/providers',
    certification: '/provider-certification',
    marketplace: '/marketplace',
    traders: '/traders',
    traderIntelligence: '/trader-intelligence',
    affiliate: '/affiliate',
    ib: '/ib',
    whiteLabel: '/white-label',
    notifications: '/notifications',
    replay: '/replay',
    admin: '/admin',
    compliance: '/compliance',
    executive: '/executive',
    support: '/support',
    solana: '/solana',
    verification: '/verification',
    webhooks: '/webhooks',
  },
});

export default apiConfig;
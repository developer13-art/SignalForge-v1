/**
 * Feature Flags Configuration
 *
 * Controls the availability of platform features at runtime. Flags
 * are read from environment variables and can be overridden per
 * tenant or per user in the future.
 *
 * @module signalforge/server/config/feature-flags
 */

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return ['true', '1', 'yes', 'on', 'enabled'].includes(String(value).toLowerCase());
}

const featureFlagsConfig = Object.freeze({
  solana: toBoolean(process.env.FEATURE_SOLANA, true),
  copyTrading: toBoolean(process.env.FEATURE_COPY_TRADING, true),
  consensus: toBoolean(process.env.FEATURE_CONSENSUS, true),
  providerCertification: toBoolean(process.env.FEATURE_PROVIDER_CERTIFICATION, true),
  whiteLabel: toBoolean(process.env.FEATURE_WHITE_LABEL, false),
  marketplace: toBoolean(process.env.FEATURE_MARKETPLACE, true),
  referrals: toBoolean(process.env.FEATURE_REFERRALS, true),

  telegram: toBoolean(process.env.FEATURE_TELEGRAM, true),
  discord: toBoolean(process.env.FEATURE_DISCORD, true),
  whatsapp: toBoolean(process.env.FEATURE_WHATSAPP, true),
  tradingview: toBoolean(process.env.FEATURE_TRADINGVIEW, true),
  email: toBoolean(process.env.FEATURE_EMAIL, true),
  restApi: toBoolean(process.env.FEATURE_REST_API, true),

  providerDna: toBoolean(process.env.FEATURE_PROVIDER_DNA, true),
  aiTraderIntelligence: toBoolean(process.env.FEATURE_TRADER_INTELLIGENCE, true),
  tradeShadow: toBoolean(process.env.FEATURE_TRADE_SHADOW, true),
  replay: toBoolean(process.env.FEATURE_REPLAY, true),

  affiliate: toBoolean(process.env.FEATURE_AFFILIATE, true),
  ib: toBoolean(process.env.FEATURE_IB, true),

  stripe: toBoolean(process.env.FEATURE_STRIPE, true),
  paystack: toBoolean(process.env.FEATURE_PAYSTACK, true),
  flutterwave: toBoolean(process.env.FEATURE_FLUTTERWAVE, false),

  kyc: toBoolean(process.env.FEATURE_KYC, true),
  twoFactor: toBoolean(process.env.FEATURE_TWO_FACTOR, true),

  manualTrading: toBoolean(process.env.FEATURE_MANUAL_TRADING, true),
  automatedTrading: toBoolean(process.env.FEATURE_AUTOMATED_TRADING, true),
  demoAccounts: toBoolean(process.env.FEATURE_DEMO_ACCOUNTS, true),
  liveAccounts: toBoolean(process.env.FEATURE_LIVE_ACCOUNTS, true),

  pushNotifications: toBoolean(process.env.FEATURE_PUSH, true),
  smsNotifications: toBoolean(process.env.FEATURE_SMS, true),
  emailNotifications: toBoolean(process.env.FEATURE_EMAIL_NOTIFICATIONS, true),
  telegramNotifications: toBoolean(process.env.FEATURE_TELEGRAM_NOTIFICATIONS, true),
  discordNotifications: toBoolean(process.env.FEATURE_DISCORD_NOTIFICATIONS, true),
  webhookNotifications: toBoolean(process.env.FEATURE_WEBHOOK_NOTIFICATIONS, true),

  maintenanceMode: toBoolean(process.env.FEATURE_MAINTENANCE_MODE, false),
  readOnlyMode: toBoolean(process.env.FEATURE_READ_ONLY, false),
  signupEnabled: toBoolean(process.env.FEATURE_SIGNUP_ENABLED, true),
  loginEnabled: toBoolean(process.env.FEATURE_LOGIN_ENABLED, true),
  tradingEnabled: toBoolean(process.env.FEATURE_TRADING_ENABLED, true),
  withdrawalsEnabled: toBoolean(process.env.FEATURE_WITHDRAWALS_ENABLED, true),
  referralsEnabled: toBoolean(process.env.FEATURE_REFERRALS_ENABLED, true),

  experimentalFeatures: toBoolean(process.env.FEATURE_EXPERIMENTAL, false),
  betaFeatures: toBoolean(process.env.FEATURE_BETA, false),
});

export default featureFlagsConfig;
/**
 * Routes Barrel Export
 *
 * Central export point for all route modules. The actual mounting is
 * handled in `bootstrap/registerRoutes.js`; this barrel exists so
 * that tests and internal tooling can import individual routers.
 *
 * @module signalforge/server/routes
 */

export { default as publicRoutes } from './public.routes.js';
export { default as authRoutes } from './auth.routes.js';
export { default as userRoutes } from './user.routes.js';
export { default as rbacRoutes } from './rbac.routes.js';
export { default as kycRoutes } from './kyc.routes.js';
export { default as signalSourceRoutes } from './signal-source.routes.js';
export { default as telegramRoutes } from './telegram.routes.js';
export { default as discordRoutes } from './discord.routes.js';
export { default as whatsappRoutes } from './whatsapp.routes.js';
export { default as tradingviewRoutes } from './tradingview.routes.js';
export { default as emailRoutes } from './email.routes.js';
export { default as restApiRoutes } from './rest-api.routes.js';
export { default as signalRoutes } from './signal.routes.js';
export { default as aiRoutes } from './ai.routes.js';
export { default as providerDnaRoutes } from './provider-dna.routes.js';
export { default as tradeMatchingRoutes } from './trade-matching.routes.js';
export { default as consensusRoutes } from './consensus.routes.js';
export { default as validationRoutes } from './validation.routes.js';
export { default as riskRoutes } from './risk.routes.js';
export { default as automationRoutes } from './automation.routes.js';
export { default as executionRoutes } from './execution.routes.js';
export { default as tradeStateRoutes } from './trade-state.routes.js';
export { default as tradeShadowRoutes } from './trade-shadow.routes.js';
export { default as copyTradingRoutes } from './copy-trading.routes.js';
export { default as brokerRoutes } from './broker.routes.js';
export { default as tradeRoutes } from './trade.routes.js';
export { default as analyticsRoutes } from './analytics.routes.js';
export { default as performanceRoutes } from './performance.routes.js';
export { default as subscriptionRoutes } from './subscription.routes.js';
export { default as paymentRoutes } from './payment.routes.js';
export { default as walletRoutes } from './wallet.routes.js';
export { default as withdrawalRoutes } from './withdrawal.routes.js';
export { default as referralRoutes } from './referral.routes.js';
export { default as providerRoutes } from './provider.routes.js';
export { default as providerCertificationRoutes } from './provider-certification.routes.js';
export { default as marketplaceRoutes } from './marketplace.routes.js';
export { default as traderRoutes } from './trader.routes.js';
export { default as traderIntelligenceRoutes } from './trader-intelligence.routes.js';
export { default as affiliateRoutes } from './affiliate.routes.js';
export { default as ibRoutes } from './ib.routes.js';
export { default as whiteLabelRoutes } from './white-label.routes.js';
export { default as notificationRoutes } from './notification.routes.js';
export { default as replayRoutes } from './replay.routes.js';
export { default as adminRoutes } from './admin.routes.js';
export { default as complianceRoutes } from './compliance.routes.js';
export { default as executiveRoutes } from './executive.routes.js';
export { default as supportRoutes } from './support.routes.js';
export { default as solanaRoutes } from './solana.routes.js';
export { default as verificationRoutes } from './verification.routes.js';
export { default as webhookRoutes } from './webhook.routes.js';
export { default as healthRoutes, buildHealthRouter } from './health.routes.js';
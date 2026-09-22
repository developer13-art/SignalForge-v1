/**
 * Route Registration
 *
 * Mounts all API route modules onto the Express application. Routes
 * are grouped by domain and prefixed under `/api`.
 *
 * @module signalforge/server/bootstrap/registerRoutes
 */

import { Router } from 'express';

import { getLogger } from './initLogger.js';

import publicRoutes from '../routes/public.routes.js';
import authRoutes from '../routes/auth.routes.js';
import userRoutes from '../routes/user.routes.js';
import rbacRoutes from '../routes/rbac.routes.js';
import kycRoutes from '../routes/kyc.routes.js';
import signalSourceRoutes from '../routes/signal-source.routes.js';
import telegramRoutes from '../routes/telegram.routes.js';
import discordRoutes from '../routes/discord.routes.js';
import whatsappRoutes from '../routes/whatsapp.routes.js';
import tradingviewRoutes from '../routes/tradingview.routes.js';
import emailRoutes from '../routes/email.routes.js';
import restApiRoutes from '../routes/rest-api.routes.js';
import signalRoutes from '../routes/signal.routes.js';
import aiRoutes from '../routes/ai.routes.js';
import providerDnaRoutes from '../routes/provider-dna.routes.js';
import tradeMatchingRoutes from '../routes/trade-matching.routes.js';
import consensusRoutes from '../routes/consensus.routes.js';
import validationRoutes from '../routes/validation.routes.js';
import riskRoutes from '../routes/risk.routes.js';
import automationRoutes from '../routes/automation.routes.js';
import executionRoutes from '../routes/execution.routes.js';
import tradeStateRoutes from '../routes/trade-state.routes.js';
import tradeShadowRoutes from '../routes/trade-shadow.routes.js';
import copyTradingRoutes from '../routes/copy-trading.routes.js';
import brokerRoutes from '../routes/broker.routes.js';
import tradeRoutes from '../routes/trade.routes.js';
import analyticsRoutes from '../routes/analytics.routes.js';
import performanceRoutes from '../routes/performance.routes.js';
import subscriptionRoutes from '../routes/subscription.routes.js';
import paymentRoutes from '../routes/payment.routes.js';
import walletRoutes from '../routes/wallet.routes.js';
import withdrawalRoutes from '../routes/withdrawal.routes.js';
import referralRoutes from '../routes/referral.routes.js';
import providerRoutes from '../routes/provider.routes.js';
import providerCertificationRoutes from '../routes/provider-certification.routes.js';
import marketplaceRoutes from '../routes/marketplace.routes.js';
import traderRoutes from '../routes/trader.routes.js';
import traderIntelligenceRoutes from '../routes/trader-intelligence.routes.js';
import affiliateRoutes from '../routes/affiliate.routes.js';
import ibRoutes from '../routes/ib.routes.js';
import whiteLabelRoutes from '../routes/white-label.routes.js';
import notificationRoutes from '../routes/notification.routes.js';
import replayRoutes from '../routes/replay.routes.js';
import adminRoutes from '../routes/admin.routes.js';
import complianceRoutes from '../routes/compliance.routes.js';
import executiveRoutes from '../routes/executive.routes.js';
import supportRoutes from '../routes/support.routes.js';
import solanaRoutes from '../routes/solana.routes.js';
import verificationRoutes from '../routes/verification.routes.js';
import webhookRoutes from '../routes/webhook.routes.js';
import { buildHealthRouter } from '../routes/health.routes.js';

export function registerRoutes(app) {
  const logger = getLogger('routes');
  const api = Router();

  api.use('/health', buildHealthRouter());

  api.use('/', publicRoutes);
  api.use('/auth', authRoutes);
  api.use('/users', userRoutes);
  api.use('/rbac', rbacRoutes);
  api.use('/kyc', kycRoutes);

  api.use('/sources', signalSourceRoutes);
  api.use('/sources/telegram', telegramRoutes);
  api.use('/sources/discord', discordRoutes);
  api.use('/sources/whatsapp', whatsappRoutes);
  api.use('/sources/tradingview', tradingviewRoutes);
  api.use('/sources/email', emailRoutes);
  api.use('/sources/rest-api', restApiRoutes);

  api.use('/signals', signalRoutes);
  api.use('/ai', aiRoutes);
  api.use('/provider-dna', providerDnaRoutes);
  api.use('/trade-matching', tradeMatchingRoutes);
  api.use('/consensus', consensusRoutes);
  api.use('/validation', validationRoutes);
  api.use('/risk', riskRoutes);
  api.use('/automation', automationRoutes);
  api.use('/execution', executionRoutes);
  api.use('/trade-state', tradeStateRoutes);
  api.use('/trade-shadow', tradeShadowRoutes);
  api.use('/copy-trading', copyTradingRoutes);

  api.use('/brokers', brokerRoutes);
  api.use('/trades', tradeRoutes);
  api.use('/analytics', analyticsRoutes);
  api.use('/performance', performanceRoutes);

  api.use('/subscriptions', subscriptionRoutes);
  api.use('/payments', paymentRoutes);
  api.use('/wallets', walletRoutes);
  api.use('/withdrawals', withdrawalRoutes);
  api.use('/referrals', referralRoutes);

  api.use('/providers', providerRoutes);
  api.use('/providers/certification', providerCertificationRoutes);
  api.use('/marketplace', marketplaceRoutes);
  api.use('/traders', traderRoutes);
  api.use('/trader-intelligence', traderIntelligenceRoutes);
  api.use('/affiliate', affiliateRoutes);
  api.use('/ib', ibRoutes);
  api.use('/white-label', whiteLabelRoutes);

  api.use('/notifications', notificationRoutes);
  api.use('/replay', replayRoutes);

  api.use('/admin', adminRoutes);
  api.use('/compliance', complianceRoutes);
  api.use('/executive', executiveRoutes);
  api.use('/support', supportRoutes);

  api.use('/solana', solanaRoutes);
  api.use('/verify', verificationRoutes);
  api.use('/webhooks', webhookRoutes);

  app.use('/api', api);

  logger.info('API routes registered');
}

export default registerRoutes;
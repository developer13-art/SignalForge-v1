'use strict';

/**
 * Config Barrel Export
 *
 * Central export point for all configuration modules. Each config
 * module reads its values from environment variables and provides
 * sensible defaults for development.
 *
 * @module signalforge/server/config
 */

const appConfig = require('./app.config');
const databaseConfig = require('./database.config');
const jwtConfig = require('./jwt.config');
const sessionConfig = require('./session.config');
const mailConfig = require('./mail.config');
const smsConfig = require('./sms.config');
const pushConfig = require('./push.config');
const aiConfig = require('./ai.config');
const llmConfig = require('./llm.config');
const metaApiConfig = require('./metaapi.config');
const storageConfig = require('./storage.config');
const paymentConfig = require('./payment.config');
const stripeConfig = require('./stripe.config');
const paystackConfig = require('./paystack.config');
const flutterwaveConfig = require('./flutterwave.config');
const kycConfig = require('./kyc.config');
const smileIdConfig = require('./smileid.config');
const verifyMeConfig = require('./verifyme.config');
const solanaConfig = require('./solana.config');
const telegramConfig = require('./telegram.config');
const discordConfig = require('./discord.config');
const whatsAppConfig = require('./whatsapp.config');
const tradingViewConfig = require('./tradingview.config');
const imapConfig = require('./imap.config');
const loggerConfig = require('./logger.config');
const securityConfig = require('./security.config');
const corsConfig = require('./cors.config');
const rateLimitConfig = require('./rate-limit.config');
const featureFlagsConfig = require('./feature-flags.config');
const sessionStoreConfig = require('./session-store.config');
const webSocketConfig = require('./websocket.config');
const metricsConfig = require('./metrics.config');

const config = {
  app: appConfig,
  database: databaseConfig,
  jwt: jwtConfig,
  session: sessionConfig,
  mail: mailConfig,
  sms: smsConfig,
  push: pushConfig,
  ai: aiConfig,
  llm: llmConfig,
  metaApi: metaApiConfig,
  storage: storageConfig,
  payment: paymentConfig,
  stripe: stripeConfig,
  paystack: paystackConfig,
  flutterwave: flutterwaveConfig,
  kyc: kycConfig,
  smileId: smileIdConfig,
  verifyMe: verifyMeConfig,
  solana: solanaConfig,
  telegram: telegramConfig,
  discord: discordConfig,
  whatsApp: whatsAppConfig,
  tradingView: tradingViewConfig,
  imap: imapConfig,
  logger: loggerConfig,
  security: securityConfig,
  cors: corsConfig,
  rateLimit: rateLimitConfig,
  featureFlags: featureFlagsConfig,
  sessionStore: sessionStoreConfig,
  webSocket: webSocketConfig,
  metrics: metricsConfig,
};

module.exports = config;
module.exports.config = config;
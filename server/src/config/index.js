/**
 * Config Barrel Export
 *
 * Central export point for all configuration modules. Each config
 * module reads its values from environment variables and provides
 * sensible defaults for development.
 *
 * @module signalforge/server/config
 */

import appConfig from './app.config.js';
import databaseConfig from './database.config.js';
import jwtConfig from './jwt.config.js';
import sessionConfig from './session.config.js';
import mailConfig from './mail.config.js';
import smsConfig from './sms.config.js';
import pushConfig from './push.config.js';
import aiConfig from './ai.config.js';
import llmConfig from './llm.config.js';
import metaApiConfig from './metaapi.config.js';
import storageConfig from './storage.config.js';
import paymentConfig from './payment.config.js';
import stripeConfig from './stripe.config.js';
import paystackConfig from './paystack.config.js';
import flutterwaveConfig from './flutterwave.config.js';
import kycConfig from './kyc.config.js';
import smileIdConfig from './smileid.config.js';
import verifyMeConfig from './verifyme.config.js';
import solanaConfig from './solana.config.js';
import telegramConfig from './telegram.config.js';
import discordConfig from './discord.config.js';
import whatsAppConfig from './whatsapp.config.js';
import tradingViewConfig from './tradingview.config.js';
import imapConfig from './imap.config.js';
import loggerConfig from './logger.config.js';
import securityConfig from './security.config.js';
import corsConfig from './cors.config.js';
import rateLimitConfig from './rate-limit.config.js';
import featureFlagsConfig from './feature-flags.config.js';
import sessionStoreConfig from './session-store.config.js';
import webSocketConfig from './websocket.config.js';
import metricsConfig from './metrics.config.js';

export {
  appConfig,
  databaseConfig,
  jwtConfig,
  sessionConfig,
  mailConfig,
  smsConfig,
  pushConfig,
  aiConfig,
  llmConfig,
  metaApiConfig,
  storageConfig,
  paymentConfig,
  stripeConfig,
  paystackConfig,
  flutterwaveConfig,
  kycConfig,
  smileIdConfig,
  verifyMeConfig,
  solanaConfig,
  telegramConfig,
  discordConfig,
  whatsAppConfig,
  tradingViewConfig,
  imapConfig,
  loggerConfig,
  securityConfig,
  corsConfig,
  rateLimitConfig,
  featureFlagsConfig,
  sessionStoreConfig,
  webSocketConfig,
  metricsConfig,
};

export default {
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
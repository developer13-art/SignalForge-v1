'use strict';

const registerRoutes = require('./registerRoutes');
const registerMiddleware = require('./registerMiddleware');
const registerErrorHandlers = require('./registerErrorHandlers');
const registerGracefulShutdown = require('./registerGracefulShutdown');

const initDatabase = require('./initDatabase');
const initMigrations = require('./initMigrations');
const initEventBus = require('./initEventBus');
const initJobScheduler = require('./initJobScheduler');
const initJobRunner = require('./initJobRunner');
const initWebSocket = require('./initWebSocket');
const initSolanaConnection = require('./initSolanaConnection');
const initSolanaIndexer = require('./initSolanaIndexer');
const initTelegramListeners = require('./initTelegramListeners');
const initDiscordListeners = require('./initDiscordListeners');
const initWhatsAppListeners = require('./initWhatsAppListeners');
const initEmailListeners = require('./initEmailListeners');
const initMetaApiStreams = require('./initMetaApiStreams');
const loadEnv = require('./loadEnv');
const validateEnv = require('./validateEnv');

/**
 * SignalForge - Bootstrap Sequence
 *
 * Every subsystem the platform needs at startup is initialized in
 * strict order. New features (Solana Actions, Proof of Alpha, hybrid
 * execution) register their initializers here.
 */
async function bootstrap(app) {
  // Environment
  loadEnv();
  validateEnv();

  // Persistence
  await initDatabase();
  await initMigrations();

  // Infrastructure
  await initEventBus();
  await initJobScheduler();
  await initJobRunner();

  // Solana
  await initSolanaConnection();
  await initSolanaIndexer();

  // Signal sources
  await initTelegramListeners();
  await initDiscordListeners();
  await initWhatsAppListeners();
  await initEmailListeners();

  // Broker connectivity
  await initMetaApiStreams();

  // Real-time
  await initWebSocket(app);

  // HTTP
  registerMiddleware(app);
  registerRoutes(app);
  registerErrorHandlers(app);
  registerGracefulShutdown();

  return app;
}

module.exports = bootstrap;
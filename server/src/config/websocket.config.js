/**
 * WebSocket Configuration
 *
 * Configures the real-time WebSocket server used to push live
 * updates to connected clients. Uses socket.io over the same HTTP
 * server as the REST API.
 *
 * @module signalforge/server/config/websocket
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

const webSocketConfig = Object.freeze({
  enabled: toBoolean(process.env.WEBSOCKET_ENABLED, true),
  path: process.env.WEBSOCKET_PATH || '/ws',
  corsOrigin: process.env.WEBSOCKET_CORS_ORIGIN || process.env.CORS_ORIGINS || '*',

  pingIntervalMs: toNumber(process.env.WEBSOCKET_PING_INTERVAL_MS, 25000),
  pingTimeoutMs: toNumber(process.env.WEBSOCKET_PING_TIMEOUT_MS, 20000),
  upgradeTimeoutMs: toNumber(process.env.WEBSOCKET_UPGRADE_TIMEOUT_MS, 10000),
  maxHttpBufferSize: toNumber(
    process.env.WEBSOCKET_MAX_HTTP_BUFFER_SIZE,
    1024 * 1024,
  ),

  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  perMessageDeflate: false,

  auth: {
    required: true,
    tokenHeader: 'authorization',
    tokenQueryParam: 'token',
  },

  reconnect: {
    maxAttempts: toNumber(process.env.WEBSOCKET_RECONNECT_MAX_ATTEMPTS, 5),
    delayMs: toNumber(process.env.WEBSOCKET_RECONNECT_DELAY_MS, 2000),
  },

  rateLimit: {
    messagesPerSecond: toNumber(process.env.WEBSOCKET_MESSAGES_PER_SECOND, 30),
    maxConnectionsPerUser: toNumber(
      process.env.WEBSOCKET_MAX_CONNECTIONS_PER_USER,
      10,
    ),
    maxConnectionsPerIp: toNumber(
      process.env.WEBSOCKET_MAX_CONNECTIONS_PER_IP,
      50,
    ),
  },

  rooms: {
    userPrefix: 'user:',
    tradePrefix: 'trade:',
    signalPrefix: 'signal:',
    providerPrefix: 'provider:',
    adminRoom: 'admin',
    complianceRoom: 'compliance',
  },

  channels: [
    'signal',
    'trade',
    'account',
    'notification',
    'risk',
    'solana',
    'system',
  ],

  events: {
    connect: 'connect',
    disconnect: 'disconnect',
    error: 'error',
    subscribe: 'subscribe',
    unsubscribe: 'unsubscribe',
    authenticate: 'authenticate',
    ping: 'ping',
    pong: 'pong',
    notification: 'notification',
    tradeUpdate: 'trade:update',
    signalUpdate: 'signal:update',
    accountUpdate: 'account:update',
  },

  logging: {
    logConnections: toBoolean(process.env.WEBSOCKET_LOG_CONNECTIONS, true),
    logEvents: toBoolean(process.env.WEBSOCKET_LOG_EVENTS, false),
  },
});

export default webSocketConfig;
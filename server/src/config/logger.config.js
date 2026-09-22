/**
 * Logger Configuration
 *
 * Configures the platform logger. Uses pino in production and
 * pino-pretty in development for human-readable output.
 *
 * @module signalforge/server/config/logger
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

const env = process.env.NODE_ENV || 'development';
const isDevelopment = env === 'development';

const loggerConfig = Object.freeze({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  format: process.env.LOG_FORMAT || (isDevelopment ? 'pretty' : 'json'),
  name: 'signalforge-server',

  filePath: process.env.LOG_FILE_PATH || 'logs',
  fileEnabled: toBoolean(process.env.LOG_FILE_ENABLED, env === 'production'),
  fileRotationEnabled: toBoolean(process.env.LOG_FILE_ROTATION_ENABLED, true),
  fileMaxSizeMb: toNumber(process.env.LOG_FILE_MAX_SIZE_MB, 50),
  fileMaxFiles: toNumber(process.env.LOG_FILE_MAX_FILES, 10),

  redact: {
    enabled: true,
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      'req.body.password',
      'req.body.passwordConfirm',
      'req.body.currentPassword',
      'req.body.newPassword',
      'req.body.secret',
      'req.body.token',
      'req.body.apiKey',
      'req.body.sessionToken',
      'req.body.brokerPassword',
      'req.body.metaApiToken',
      'req.body.walletPrivateKey',
      'res.headers["set-cookie"]',
      'password',
      'passwordHash',
      'secret',
      'apiKey',
      'token',
      'refreshToken',
      'accessToken',
      'sessionToken',
      'brokerPassword',
      'metaApiToken',
      'privateKey',
      'walletPrivateKey',
    ],
    censor: '[REDACTED]',
  },

  serializers: {
    req(request) {
      return {
        id: request.id,
        method: request.method,
        url: request.url,
        path: request.url,
        remoteAddress: request.ip,
        remotePort: request.socket?.remotePort,
        userAgent: request.headers?.['user-agent'],
      };
    },
    res(response) {
      return {
        statusCode: response.statusCode,
      };
    },
    err(error) {
      if (!error || typeof error !== 'object') {
        return error;
      }
      return {
        type: error.name,
        message: error.message,
        code: error.code,
        stack: isDevelopment ? error.stack : undefined,
        details: error.details,
      };
    },
  },

  timestamp: true,
  messageKey: 'msg',

  base: {
    service: 'signalforge',
    env,
    version: '1.0.0',
  },

  prettyOptions: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
    singleLine: false,
    messageFormat: '{msg}',
    errorLikeObjectKeys: ['err', 'error'],
    errorProps: 'code,details,statusCode',
  },

  enabled: true,
  silent: toBoolean(process.env.LOG_SILENT, env === 'test'),
});

export default loggerConfig;
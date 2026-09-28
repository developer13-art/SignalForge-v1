/**
 * Logger Initialization
 *
 * Initializes the platform logger with configuration from
 * `logger.config.js`. Provides a namespace helper so that each
 * module can create a child logger.
 *
 * @module signalforge/server/bootstrap/initLogger
 */
const pino = require('pino');
const loggerConfig = require('../config/logger.config.js');

let rootLogger = null;

function buildTransport() {
  if (loggerConfig.silent || !loggerConfig.enabled) {
    return undefined;
  }

  if (loggerConfig.format === 'pretty') {
    return {
      target: 'pino-pretty',
      options: loggerConfig.prettyOptions,
    };
  }

  return undefined;
}
function initLogger() {
  if (rootLogger) {
    return rootLogger;
  }

  const transport = buildTransport();

  rootLogger = pino({
    name: loggerConfig.name,
    level: loggerConfig.level,
    timestamp: loggerConfig.timestamp,
    messageKey: loggerConfig.messageKey,
    base: loggerConfig.base,
    redact: loggerConfig.redact.enabled
      ? {
          paths: loggerConfig.redact.paths,
          censor: loggerConfig.redact.censor,
        }
      : undefined,
    serializers: loggerConfig.serializers,
    enabled: loggerConfig.enabled,
    silent: loggerConfig.silent,
    transport,
  });

  return rootLogger;
}
function getLogger(namespace) {
  const logger = rootLogger || initLogger();
  if (!namespace) {
    return logger;
  }
  return logger.child({ module: namespace });
}
function isLoggerInitialized() {
  return rootLogger !== null;
}
function resetLogger() {
  rootLogger = null;
}
module.exports = initLogger;
module.exports.initLogger = initLogger;
module.exports.getLogger = getLogger;
module.exports.isLoggerInitialized = isLoggerInitialized;
module.exports.resetLogger = resetLogger;

/**
 * Session Middleware
 *
 * Applies server-side session management backed by PostgreSQL.
 * Sessions are never stored in memory in production.
 *
 * @module signalforge/server/middleware/session
 */
const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');
const sessionConfig = require('../config/session.config.js');
const databaseConfig = require('../config/database.config.js');
const appConfig = require('../config/app.config.js');
const { getLogger } = require('../bootstrap/initLogger.js');
function sessionMiddleware() {
  const logger = getLogger('session');

  if (appConfig.isTest) {
    return session({
      secret: sessionConfig.secret,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, httpOnly: true, sameSite: 'lax' },
    });
  }

  const PgStore = connectPgSimple(session);

  const store = new PgStore({
    conObject: {
      host: databaseConfig.host,
      port: databaseConfig.port,
      database: databaseConfig.database,
      user: databaseConfig.user,
      password: databaseConfig.password,
      ssl: databaseConfig.ssl,
    },
    tableName: sessionConfig.store.tableName,
    schemaName: sessionConfig.store.schemaName,
    pruneSessionInterval: sessionConfig.store.pruneSessionInterval,
    createTableIfMissing: sessionConfig.store.createTableIfMissing,
    errorLog: (error) => logger.error({ err: error }, 'Session store error'),
  });

  return session({
    name: sessionConfig.name,
    secret: sessionConfig.secret,
    resave: sessionConfig.resave,
    saveUninitialized: sessionConfig.saveUninitialized,
    rolling: sessionConfig.rolling,
    cookie: sessionConfig.cookie,
    store,
    proxy: sessionConfig.proxy,
    unset: sessionConfig.unset,
  });
}
module.exports = sessionMiddleware;
module.exports.sessionMiddleware = sessionMiddleware;

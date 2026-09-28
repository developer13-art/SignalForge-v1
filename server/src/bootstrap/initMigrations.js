'use strict';

/**
 * Migration Runner Initialization
 *
 * Runs any pending database migrations at server startup. Migration
 * execution is guarded by an advisory lock so that multiple server
 * instances do not attempt to run migrations concurrently.
 *
 * @module signalforge/server/bootstrap/initMigrations
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const databaseConfig = require('../config/database.config.js');
const appConfig = require('../config/app.config.js');
const { getLogger } = require('./initLogger.js');

const MIGRATION_LOCK_ID = 9001;
const MAX_MIGRATION_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;
const KEEPALIVE_INTERVAL_MS = 10000;

let runnerState = null;

async function loadMigrationFiles() {
  const dir = path.resolve(process.cwd(), databaseConfig.migrations.directory);
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((name) => /^\d{3,}_[A-Za-z0-9_]+\.js$/.test(name))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name, path: path.join(dir, name) }));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function importMigration(filePath) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const loaded = require(filePath);
  const migration = loaded && loaded.default ? loaded.default : loaded;

  if (!migration || typeof migration.up !== 'function') {
    throw new Error(`Migration ${filePath} does not export an "up" function`);
  }
  return migration;
}

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(128) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      execution_time_ms INTEGER NOT NULL DEFAULT 0
    )
  `);
}

function isTransientError(error) {
  const transientCodes = ['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ECONNREFUSED'];
  const transientMessages = [
    'Connection terminated unexpectedly',
    'Client was closed and is not queryable',
    'Connection terminated due to connection timeout',
    'Client has encountered a connection error',
  ];
  if (transientCodes.includes(error.code)) {
    return true;
  }
  const message = String(error.message || '');
  return transientMessages.some((m) => message.includes(m));
}

async function runMigrationWithRetry({ client, migration, file, logger }) {
  for (let attempt = 1; attempt <= MAX_MIGRATION_ATTEMPTS; attempt += 1) {
    try {
      await migration.up(client);
      return;
    } catch (error) {
      if (!isTransientError(error) || attempt === MAX_MIGRATION_ATTEMPTS) {
        logger.fatal(
          { err: error, file: file.name, attempt },
          'Migration failed; aborting startup',
        );
        throw error;
      }

      logger.warn(
        { file: file.name, attempt, err: error.message },
        'Transient error during migration; retrying',
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

async function initMigrations(dependencies = {}) {
  const logger = getLogger('migrations');

  if (runnerState) {
    logger.warn('Migration runner already initialized');
    return runnerState;
  }

  const db = dependencies.db;
  if (!db || typeof db.advisoryLock !== 'function') {
    throw new Error('initMigrations requires a database dependency');
  }

  if (appConfig.isTest) {
    logger.info('Skipping migrations in test environment');
    runnerState = { skipped: true, applied: 0 };
    return runnerState;
  }

  const applied = await db.advisoryLock(MIGRATION_LOCK_ID, async (client) => {
    await ensureMigrationTable(client);

    const existing = await client.query('SELECT filename FROM schema_migrations');
    const appliedSet = new Set(existing.rows.map((row) => row.filename));

    const files = await loadMigrationFiles();
    let appliedCount = 0;

    // Keep the Neon compute warm during long migration sequences so
    // that autosuspend does not terminate the connection mid-run.
    const keepalive = setInterval(() => {
      client.query('SELECT 1').catch(() => {});
    }, KEEPALIVE_INTERVAL_MS);
    if (keepalive.unref) {
      keepalive.unref();
    }

    try {
      for (const file of files) {
        if (appliedSet.has(file.name)) {
          continue;
        }

        const start = Date.now();
        const migration = importMigration(file.path);

        await runMigrationWithRetry({ client, migration, file, logger });

        const duration = Date.now() - start;

        await client.query(
          'INSERT INTO schema_migrations (filename, checksum, execution_time_ms) VALUES ($1, $2, $3)',
          [file.name, 'not-computed', duration],
        );

        logger.info({ file: file.name, duration }, 'Migration applied');
        appliedCount++;
      }
    } finally {
      clearInterval(keepalive);
    }

    return appliedCount;
  });

  logger.info({ applied }, 'Migrations runner ready');

  runnerState = {
    skipped: false,
    applied,
    async close() {
      runnerState = null;
    },
  };

  return runnerState;
}

module.exports = initMigrations;
module.exports.initMigrations = initMigrations;
module.exports.importMigration = importMigration;
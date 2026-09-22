/**
 * Migration Runner Initialization
 *
 * Runs any pending database migrations at server startup. Migration
 * execution is guarded by an advisory lock so that multiple server
 * instances do not attempt to run migrations concurrently.
 *
 * @module signalforge/server/bootstrap/initMigrations
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import databaseConfig from '../config/database.config.js';
import appConfig from '../config/app.config.js';
import { getLogger } from './initLogger.js';

const MIGRATION_LOCK_ID = 9001;

let runnerState = null;

async function ensureMigrationTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(128) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      execution_time_ms INTEGER NOT NULL DEFAULT 0
    )
  `);
}

async function loadMigrationFiles() {
  const dir = path.resolve(process.cwd(), databaseConfig.migrations.directory);
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((name) => name.endsWith('.js'))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name, path: path.join(dir, name) }));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function getAppliedMigrations(db) {
  const result = await db.query('SELECT filename FROM schema_migrations ORDER BY id ASC');
  return new Set(result.rows.map((row) => row.filename));
}

async function importMigration(filePath) {
  const url = `file://${filePath}`;
  const module = await import(url);
  if (typeof module.up !== 'function') {
    throw new Error(`Migration ${filePath} does not export an "up" function`);
  }
  return module;
}

export async function initMigrations(dependencies = {}) {
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
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        checksum VARCHAR(128) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        execution_time_ms INTEGER NOT NULL DEFAULT 0
      )
    `);

    const existing = await client.query('SELECT filename FROM schema_migrations');
    const appliedSet = new Set(existing.rows.map((row) => row.filename));

    const files = await loadMigrationFiles();
    let appliedCount = 0;

    for (const file of files) {
      if (appliedSet.has(file.name)) {
        continue;
      }

      const start = Date.now();
      const migration = await importMigration(file.path);

      try {
        await migration.up(client);
      } catch (error) {
        logger.fatal(
          { err: error, file: file.name },
          'Migration failed; aborting startup',
        );
        throw error;
      }

      const duration = Date.now() - start;

      await client.query(
        'INSERT INTO schema_migrations (filename, checksum, execution_time_ms) VALUES ($1, $2, $3)',
        [file.name, 'not-computed', duration],
      );

      logger.info({ file: file.name, duration }, 'Migration applied');
      appliedCount++;
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

export default initMigrations;
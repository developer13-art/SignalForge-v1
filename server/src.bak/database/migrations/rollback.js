/**
 * Migration Rollback
 *
 * Rolls back the most recently applied migration (or a specific
 * migration by filename). Each migration file must export a
 * `down(client)` function.
 *
 * @module server/database/migrations/rollback
 */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getPool } from '../connection';
import { logger } from '../../lib/logger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function importMigrationFile(filename) {
  const filePath = path.join(__dirname, filename);
  const fileUrl = pathToFileURL(filePath).href;
  const module = await import(fileUrl);
  return module.default || module;
}

export async function rollbackMigration({ filename } = {}) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    let targetFilename = filename;

    if (!targetFilename) {
      const { rows } = await client.query(
        `SELECT filename FROM schema_migrations ORDER BY filename DESC LIMIT 1`,
      );
      if (rows.length === 0) {
        logger.info('No migrations to roll back');
        return { rolledBack: null };
      }
      targetFilename = rows[0].filename;
    }

    const migration = await importMigrationFile(targetFilename);

    if (!migration || typeof migration.down !== 'function') {
      logger.warn({ filename: targetFilename }, 'Migration has no down() function');
      return { rolledBack: null, reason: 'NO_DOWN_FUNCTION' };
    }

    logger.info({ filename: targetFilename }, 'Rolling back migration');

    await client.query('BEGIN');

    try {
      await migration.down(client);
      await client.query(
        `DELETE FROM schema_migrations WHERE filename = $1`,
        [targetFilename],
      );
      await client.query('COMMIT');
      logger.info({ filename: targetFilename }, 'Migration rolled back');
      return { rolledBack: targetFilename };
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error({ err, filename: targetFilename }, 'Rollback failed');
      throw err;
    }
  } finally {
    client.release();
  }
}

export async function rollbackAll() {
  const results = [];

  for (;;) {
    const result = await rollbackMigration();
    if (!result.rolledBack) {
      break;
    }
    results.push(result.rolledBack);
  }

  return { rolledBack: results };
}

export const migrationRollback = {
  rollbackMigration,
  rollbackAll,
};
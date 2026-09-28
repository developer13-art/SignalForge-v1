'use strict';

/**
 * Rollback Script
 *
 * Rolls back the most recently applied migration. Reads the
 * `schema_migrations` table to find the last entry, calls its
 * `down()` function, and removes the entry from the table.
 *
 * @module signalforge/server/database/migrations/rollback
 */

const path = require('node:path');
const databaseConfig = require('../../config/database.config.js');

async function rollback(db) {
  const client = await db.pool.connect();
  try {
    const last = await client.query(
      'SELECT id, filename FROM schema_migrations ORDER BY id DESC LIMIT 1',
    );

    if (last.rowCount === 0) {
      return { rolledBack: 0, reason: 'no migrations applied' };
    }

    const { id, filename } = last.rows[0];
    const migrationPath = path.resolve(
      process.cwd(),
      databaseConfig.migrations.directory,
      filename,
    );

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const loaded = require(migrationPath);
    const migration = loaded && loaded.default ? loaded.default : loaded;

    if (!migration || typeof migration.down !== 'function') {
      throw new Error(`Migration ${filename} does not export a "down" function`);
    }

    await client.query('BEGIN');
    try {
      await migration.down(client);
      await client.query('DELETE FROM schema_migrations WHERE id = $1', [id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    return { rolledBack: 1, filename };
  } finally {
    client.release();
  }
}

module.exports = rollback;
module.exports.rollback = rollback;
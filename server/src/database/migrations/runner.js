/**
 * Migration Runner
 *
 * Executes pending migration files in filename order, tracking
 * applied migrations in the `schema_migrations` table. Each
 * migration file must export `up(client)` and `down(client)`
 * functions.
 *
 * @module server/database/migrations/runner
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getPool } from '../connection';
import { logger } from '../../lib/logger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
}

async function listMigrationFiles() {
  const entries = fs.readdirSync(__dirname);

  return entries
    .filter((name) => /^\d+_/.test(name) && name.endsWith('.js'))
    .filter((name) => name !== 'runner.js' && name !== 'rollback.js')
    .sort();
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    `SELECT filename FROM schema_migrations ORDER BY filename ASC`,
  );
  return rows.map((row) => row.filename);
}

async function importMigrationFile(filename) {
  const filePath = path.join(__dirname, filename);
  const fileUrl = pathToFileURL(filePath).href;
  const module = await import(fileUrl);
  return module.default || module;
}

export async function runMigrations() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const applied = await getAppliedMigrations(client);
    const files = await listMigrationFiles();

    const pending = files.filter((f) => !applied.includes(f));

    if (pending.length === 0) {
      logger.info('No pending migrations');
      return { applied: 0, pending: [] };
    }

    const appliedNow = [];

    for (const filename of pending) {
      const migration = await importMigrationFile(filename);

      if (!migration || typeof migration.up !== 'function') {
        logger.warn({ filename }, 'Migration file does not export an up() function; skipping');
        continue;
      }

      logger.info({ filename }, 'Applying migration');

      await client.query('BEGIN');

      try {
        await migration.up(client);
        await client.query(
          `INSERT INTO schema_migrations (filename) VALUES ($1)`,
          [filename],
        );
        await client.query('COMMIT');
        appliedNow.push(filename);
        logger.info({ filename }, 'Migration applied');
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error({ err, filename }, 'Migration failed; aborting run');
        throw err;
      }
    }

    return { applied: appliedNow.length, pending: appliedNow };
  } finally {
    client.release();
  }
}

export async function listAppliedMigrations() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const { rows } = await client.query(
      `SELECT filename, applied_at FROM schema_migrations ORDER BY filename ASC`,
    );
    return rows;
  } finally {
    client.release();
  }
}

export const migrationRunner = {
  runMigrations,
  listAppliedMigrations,
};
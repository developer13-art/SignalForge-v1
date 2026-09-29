'use strict';

const path = require('path');
const fs = require('fs');

const { getClient } = require('../connection');

/**
 * SignalForge - Migration Runner
 *
 * Runs every migration in order, tracking the last applied migration
 * in a `_migrations` table so that reruns are safe. The runner is
 * intentionally small: migrations are plain modules exporting `up`
 * and `down` functions.
 */

const MIGRATIONS_TABLE = '_migrations';

const MIGRATION_FILES = [
  '001_create_identity_domain.js',
  '002_create_rbac_domain.js',
  '003_create_kyc_domain.js',
  '004_create_brokers_domain.js',
  '005_create_signal_sources_domain.js',
  '006_create_signal_intelligence_domain.js',
  '007_create_providers_domain.js',
  '008_create_trading_domain.js',
  '009_create_performance_domain.js',
  '010_create_referral_domain.js',
  '011_create_payments_domain.js',
  '012_create_marketplace_domain.js',
  '013_create_affiliate_ib_domain.js',
  '014_create_white_label_domain.js',
  '015_create_financial_ops_domain.js',
  '016_create_system_domain.js',
  '017_create_security_audit_domain.js',
  '018_create_solana_domain.js',
  '019_create_indexes.js',
  '020_create_triggers.js',
  '021_create_views.js',
  '022_create_functions.js',
  '023_create_solana_actions_domain.js',
  '024_create_proof_of_alpha_domain.js',
  '025_create_hybrid_execution_domain.js',
  '026_create_crypto_market_data_domain.js',
  '027_add_auth_columns.js',
  '028_seed_system_roles_and_permissions.js',
  '029_create_verification_tokens.js',
  '030_align_two_factor_auth.js',
  '031_align_sessions_and_api_keys.js',
  '032_align_user_sessions.js',
  '033_finalize_session_token_rename.js',
];

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function listAppliedMigrations(client) {
  const result = await client.query(`SELECT name FROM ${MIGRATIONS_TABLE};`);
  return new Set(result.rows.map((row) => row.name));
}

async function runMigration(client, file) {
  const migrationPath = path.join(__dirname, file);

  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file ${file} was not found`);
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const migration = require(migrationPath);

  if (!migration || typeof migration.up !== 'function') {
    throw new Error(`Migration ${file} does not export an up() function`);
  }

  await client.query('BEGIN');
  try {
    await migration.up(client);
    await client.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1);`, [file]);
    await client.query('COMMIT');
    return { file, applied: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Migration ${file} failed: ${error.message}`);
  }
}

async function migrate({ logger } = {}) {
  const client = await getClient();
  try {
    await ensureMigrationsTable(client);
    const applied = await listAppliedMigrations(client);

    const results = [];

    for (const file of MIGRATION_FILES) {
      if (applied.has(file)) {
        results.push({ file, applied: false, reason: 'already_applied' });
        continue;
      }
      if (logger && typeof logger.info === 'function') {
        logger.info({ file }, 'Applying migration');
      }
      const result = await runMigration(client, file);
      results.push(result);
    }

    return {
      total: MIGRATION_FILES.length,
      applied: results.filter((entry) => entry.applied).length,
      results,
    };
  } finally {
    client.release();
  }
}

async function rollback({ step = 1, logger } = {}) {
  const client = await getClient();
  try {
    await ensureMigrationsTable(client);

    const result = await client.query(
      `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY applied_at DESC LIMIT $1;`,
      [step],
    );

    const toRollback = result.rows.map((row) => row.name).reverse();

    const results = [];

    for (const file of toRollback) {
      const migrationPath = path.join(__dirname, file);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const migration = require(migrationPath);

      if (!migration || typeof migration.down !== 'function') {
        throw new Error(`Migration ${file} does not export a down() function`);
      }

      await client.query('BEGIN');
      try {
        await migration.down(client);
        await client.query(`DELETE FROM ${MIGRATIONS_TABLE} WHERE name = $1;`, [file]);
        await client.query('COMMIT');
        results.push({ file, rolledBack: true });
        if (logger && typeof logger.info === 'function') {
          logger.info({ file }, 'Rolled back migration');
        }
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Rollback of ${file} failed: ${error.message}`);
      }
    }

    return { results };
  } finally {
    client.release();
  }
}

async function status({ logger } = {}) {
  const client = await getClient();
  try {
    await ensureMigrationsTable(client);
    const applied = await listAppliedMigrations(client);

    const pending = MIGRATION_FILES.filter((file) => !applied.has(file));

    return {
      total: MIGRATION_FILES.length,
      applied: applied.size,
      pending,
    };
  } finally {
    client.release();
  }
}

module.exports = {
  MIGRATION_FILES,
  migrate,
  rollback,
  status,
};
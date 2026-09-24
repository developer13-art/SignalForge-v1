/**
 * Migration 019 - Additional Indexes
 *
 * Cross-domain indexes that were not created with their parent
 * tables. This migration exists so index tuning can be versioned
 * independently.
 *
 * @module server/database/migrations/019_create_indexes
 */

export async function up(client) {
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_source_messages_unprocessed
      ON source_messages (created_at ASC)
      WHERE processing_status = 'RECEIVED';
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_signals_pending_fanout
      ON signals (created_at ASC)
      WHERE status IN ('VALIDATED', 'CONSENSUS_REACHED');
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_trades_open_user
      ON trades (user_id, opened_at DESC)
      WHERE status IN ('OPEN', 'BREAK_EVEN', 'TRAILING_STOP', 'PARTIAL_CLOSE');
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_jobs_locked
      ON jobs (status, locked_at)
      WHERE status = 'RUNNING';
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_queued
      ON notifications (scheduled_for, priority DESC)
      WHERE status = 'QUEUED';
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_solana_attestations_pending
      ON solana_attestations (created_at ASC)
      WHERE status IN ('PENDING', 'SUBMITTED');
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_solana_provenance_pending
      ON solana_provenance (created_at ASC)
      WHERE status IN ('PENDING', 'SUBMITTED');
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_solana_payments_pending
      ON solana_payments (submitted_at ASC NULLS LAST)
      WHERE status IN ('SUBMITTED', 'CONFIRMING');
  `);
}

export async function down(client) {
  await client.query(`DROP INDEX IF EXISTS idx_solana_payments_pending`);
  await client.query(`DROP INDEX IF EXISTS idx_solana_provenance_pending`);
  await client.query(`DROP INDEX IF EXISTS idx_solana_attestations_pending`);
  await client.query(`DROP INDEX IF EXISTS idx_notifications_queued`);
  await client.query(`DROP INDEX IF EXISTS idx_jobs_locked`);
  await client.query(`DROP INDEX IF EXISTS idx_trades_open_user`);
  await client.query(`DROP INDEX IF EXISTS idx_signals_pending_fanout`);
  await client.query(`DROP INDEX IF EXISTS idx_source_messages_unprocessed`);
}
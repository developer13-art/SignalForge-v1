/**
 * Migration 021 - Views
 *
 * Read-only views that simplify common analytical queries used by
 * dashboards and reports.
 *
 * @module server/database/migrations/021_create_views
 */

export async function up(client) {
  await client.query(`
    CREATE OR REPLACE VIEW v_user_trade_summary AS
    SELECT
      t.user_id,
      COUNT(*)::int AS total_trades,
      COUNT(*) FILTER (WHERE t.realized_profit > 0)::int AS winners,
      COUNT(*) FILTER (WHERE t.realized_profit < 0)::int AS losers,
      COALESCE(SUM(t.realized_profit), 0)::numeric AS net_profit
    FROM trades t
    WHERE t.status IN ('CLOSED', 'ARCHIVED')
    GROUP BY t.user_id;
  `);

  await client.query(`
    CREATE OR REPLACE VIEW v_provider_signal_stats AS
    SELECT
      s.provider_id,
      COUNT(*)::int AS total_signals,
      COUNT(*) FILTER (WHERE s.status = 'EXECUTED')::int AS executed_signals,
      COUNT(*) FILTER (WHERE s.status = 'VALIDATION_FAILED')::int AS invalid_signals,
      AVG(s.confidence)::numeric(5,4) AS average_confidence
    FROM signals s
    WHERE s.provider_id IS NOT NULL
    GROUP BY s.provider_id;
  `);

  await client.query(`
    CREATE OR REPLACE VIEW v_platform_revenue_monthly AS
    SELECT
      DATE_TRUNC('month', p.created_at) AS month,
      COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'SUCCEEDED'), 0)::numeric AS gross_revenue,
      COALESCE(SUM(p.processing_fee), 0)::numeric AS payment_fees,
      COUNT(*) FILTER (WHERE p.status = 'SUCCEEDED')::int AS successful_payments
    FROM payments p
    GROUP BY month
    ORDER BY month DESC;
  `);

  await client.query(`
    CREATE OR REPLACE VIEW v_kyc_queue_summary AS
    SELECT
      status,
      COUNT(*)::int AS count,
      MIN(submitted_at) AS oldest_submitted_at,
      MAX(submitted_at) AS newest_submitted_at
    FROM kyc_applications
    GROUP BY status;
  `);

  await client.query(`
    CREATE OR REPLACE VIEW v_solana_anchor_stats AS
    SELECT
      'attestation' AS record_type,
      status,
      COUNT(*)::int AS count
    FROM solana_attestations
    GROUP BY status
    UNION ALL
    SELECT
      'provenance' AS record_type,
      status,
      COUNT(*)::int AS count
    FROM solana_provenance
    GROUP BY status
    UNION ALL
    SELECT
      'payment' AS record_type,
      status,
      COUNT(*)::int AS count
    FROM solana_payments
    GROUP BY status;
  `);
}

export async function down(client) {
  await client.query(`DROP VIEW IF EXISTS v_solana_anchor_stats`);
  await client.query(`DROP VIEW IF EXISTS v_kyc_queue_summary`);
  await client.query(`DROP VIEW IF EXISTS v_platform_revenue_monthly`);
  await client.query(`DROP VIEW IF EXISTS v_provider_signal_stats`);
  await client.query(`DROP VIEW IF EXISTS v_user_trade_summary`);
}